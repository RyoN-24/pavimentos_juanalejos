"""Transformaciones reproducibles para series históricas de PCI."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation

import pandas as pd


def _column(frame: pd.DataFrame, *candidates: str) -> pd.Series:
    lookup = {str(name).upper(): name for name in frame.columns}
    for candidate in candidates:
        actual = lookup.get(candidate.upper())
        if actual is not None:
            return frame[actual]
    return pd.Series(pd.NA, index=frame.index, dtype="object")


def _canonical_number(value: object) -> str:
    if value is None or pd.isna(value):
        return ""
    try:
        number = Decimal(str(value).strip()).quantize(Decimal("0.000001"))
    except (InvalidOperation, ValueError):
        return str(value).strip().upper()
    normalized = format(number, "f").rstrip("0").rstrip(".")
    return normalized or "0"


def build_segment_key(route_id: object, from_measure: object, to_measure: object) -> str:
    """Crea una clave estable para el mismo tramo entre capas anuales."""
    route = str(route_id).strip().upper() if route_id is not None else ""
    return "|".join((route, _canonical_number(from_measure), _canonical_number(to_measure)))


def normalize_dc_frame(raw: pd.DataFrame, year: int) -> pd.DataFrame:
    """Normaliza nombres de campos que cambian entre capas fiscales de DDOT."""
    result = pd.DataFrame(index=raw.index)
    result["route_id"] = _column(raw, "ROUTEID")
    result["from_measure"] = pd.to_numeric(_column(raw, "FROMMEASURE"), errors="coerce")
    result["to_measure"] = pd.to_numeric(_column(raw, "TOMEASURE"), errors="coerce")
    result["pci"] = pd.to_numeric(_column(raw, "PCI"), errors="coerce")
    result["segment_length"] = pd.to_numeric(
        _column(raw, "SHAPE__LENGTH", "SHAPE_LENG", "LENGTH", "LENGTH_"),
        errors="coerce",
    )
    result["surface"] = _column(raw, "SURFACE", "SRFCTYPCRR").astype("string").str.upper()
    result["year"] = int(year)
    result["segment_id"] = [
        build_segment_key(route, start, end)
        for route, start, end in zip(
            result["route_id"], result["from_measure"], result["to_measure"]
        )
    ]
    result = result.dropna(subset=["route_id", "from_measure", "to_measure", "pci"])
    result = result[(result["pci"] >= 0) & (result["pci"] <= 100)]
    result = result[result["segment_id"].str.count(r"\|") == 2]
    return result[
        [
            "segment_id",
            "year",
            "pci",
            "segment_length",
            "from_measure",
            "to_measure",
            "surface",
        ]
    ].reset_index(drop=True)


def normalize_sandiego_pairs(
    old: pd.DataFrame, new: pd.DataFrame, start_year: int, end_year: int
) -> pd.DataFrame:
    """Construye un conjunto externo con mediciones PCI repetidas de San Diego."""
    if end_year <= start_year:
        raise ValueError("El año final debe ser posterior al inicial")
    left = old[["seg_id", "pci"]].rename(columns={"pci": "pci_current"})
    right = new[["seg_id", "pci"]].rename(columns={"pci": "pci_future"})
    pairs = left.merge(right, on="seg_id", how="inner")
    pairs["pci_current"] = pd.to_numeric(pairs["pci_current"], errors="coerce")
    pairs["pci_future"] = pd.to_numeric(pairs["pci_future"], errors="coerce")
    pairs = pairs.dropna(subset=["seg_id", "pci_current", "pci_future"])
    pairs = pairs[
        pairs["pci_current"].between(0, 100) & pairs["pci_future"].between(0, 100)
    ].copy()
    horizon = end_year - start_year
    pairs["segment_id"] = pairs["seg_id"].astype(str)
    pairs["observation_year"] = start_year
    pairs["target_year"] = end_year
    pairs["prediction_horizon_years"] = horizon
    pairs["pci_previous"] = pd.NA
    pairs["previous_annual_delta"] = pd.NA
    pairs["years_since_previous"] = pd.NA
    pairs["segment_length"] = pd.NA
    pairs["from_measure"] = pd.NA
    pairs["to_measure"] = pd.NA
    pairs["target_annual_delta"] = (
        pairs["pci_future"] - pairs["pci_current"]
    ) / horizon
    return pairs[
        [
            "segment_id",
            "observation_year",
            "target_year",
            "prediction_horizon_years",
            "pci_previous",
            "pci_current",
            "pci_future",
            "previous_annual_delta",
            "target_annual_delta",
            "years_since_previous",
            "segment_length",
            "from_measure",
            "to_measure",
        ]
    ].reset_index(drop=True)


def build_supervised_pairs(observations: pd.DataFrame) -> pd.DataFrame:
    """Convierte observaciones tramo-año en pares para predecir PCI futuro."""
    required = {
        "segment_id",
        "year",
        "pci",
        "segment_length",
        "from_measure",
        "to_measure",
    }
    missing = required.difference(observations.columns)
    if missing:
        raise ValueError(f"Faltan columnas requeridas: {sorted(missing)}")

    data = observations.copy()
    data["year"] = pd.to_numeric(data["year"], errors="coerce")
    data["pci"] = pd.to_numeric(data["pci"], errors="coerce")
    data = data.dropna(subset=["segment_id", "year", "pci"])
    data = data[(data["pci"] >= 0) & (data["pci"] <= 100)]
    data = data.sort_values(["segment_id", "year"]).drop_duplicates(
        ["segment_id", "year"], keep="last"
    )

    grouped = data.groupby("segment_id", sort=False)
    data["pci_previous"] = grouped["pci"].shift(1)
    data["year_previous"] = grouped["year"].shift(1)
    data["pci_future"] = grouped["pci"].shift(-1)
    data["target_year"] = grouped["year"].shift(-1)

    data["years_since_previous"] = data["year"] - data["year_previous"]
    data["previous_annual_delta"] = (
        (data["pci"] - data["pci_previous"]) / data["years_since_previous"]
    )
    data["prediction_horizon_years"] = data["target_year"] - data["year"]
    data["target_annual_delta"] = (
        (data["pci_future"] - data["pci"]) / data["prediction_horizon_years"]
    )

    pairs = data[data["prediction_horizon_years"] > 0].copy()
    pairs = pairs.rename(columns={"pci": "pci_current", "year": "observation_year"})
    ordered = [
        "segment_id",
        "observation_year",
        "target_year",
        "prediction_horizon_years",
        "pci_previous",
        "pci_current",
        "pci_future",
        "previous_annual_delta",
        "target_annual_delta",
        "years_since_previous",
        "segment_length",
        "from_measure",
        "to_measure",
    ]
    return pairs[ordered].reset_index(drop=True)


def temporal_holdout(pairs: pd.DataFrame, target_year: int) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Reserva todas las predicciones de un año objetivo como prueba futura."""
    train = pairs[pairs["target_year"] < target_year].copy()
    test = pairs[pairs["target_year"] == target_year].copy()
    if train.empty or test.empty:
        raise ValueError(f"La partición temporal para {target_year} produjo un conjunto vacío")
    return train.reset_index(drop=True), test.reset_index(drop=True)


def filter_probable_treatments(
    pairs: pd.DataFrame, threshold: float = 5.0
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Separa aumentos de PCI incompatibles con deterioro sin intervención."""
    improvement = pairs["pci_future"] - pairs["pci_current"]
    probable = pairs[improvement > threshold].copy()
    kept = pairs[improvement <= threshold].copy()
    return kept.reset_index(drop=True), probable.reset_index(drop=True)

