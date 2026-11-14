"""Prepara datos longitudinales de Washington D. C. y validación de San Diego."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from dataset import (
    build_supervised_pairs,
    filter_probable_treatments,
    normalize_dc_frame,
    normalize_sandiego_pairs,
)


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"
YEARS = (2019, 2020, 2021, 2022, 2023, 2024)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    frames = []
    for year in YEARS:
        raw = pd.read_csv(RAW_DIR / f"dc_pci_{year}.csv", low_memory=False)
        frames.append(normalize_dc_frame(raw, year))

    observations = pd.concat(frames, ignore_index=True)
    flexible_keys = set(
        observations.loc[
            (observations["year"] == 2023) & (observations["surface"] == "AC"),
            "segment_id",
        ]
    )
    if not flexible_keys:
        raise RuntimeError("No se identificaron segmentos de superficie AC en FY-23")
    observations = observations[observations["segment_id"].isin(flexible_keys)].copy()
    observations = observations.sort_values(["segment_id", "year"])
    all_pairs = build_supervised_pairs(observations)
    pairs, probable_treatments = filter_probable_treatments(all_pairs, threshold=5.0)

    sd_2016 = pd.read_csv(RAW_DIR / "san_diego_pci_2016.csv")
    sd_2023 = pd.read_csv(RAW_DIR / "san_diego_pci_2023.csv")
    external_all = normalize_sandiego_pairs(sd_2016, sd_2023, 2016, 2023)
    external, external_treatments = filter_probable_treatments(external_all, threshold=5.0)

    observations.to_csv(PROCESSED_DIR / "dc_flexible_observations.csv", index=False)
    pairs.to_csv(PROCESSED_DIR / "dc_training_pairs.csv", index=False)
    probable_treatments.to_csv(PROCESSED_DIR / "dc_probable_treatments.csv", index=False)
    external.to_csv(PROCESSED_DIR / "san_diego_external_pairs.csv", index=False)
    external_treatments.to_csv(
        PROCESSED_DIR / "san_diego_probable_treatments.csv", index=False
    )

    repeated_segments = int((observations.groupby("segment_id").size() >= 2).sum())
    audit = {
        "dc_observations": len(observations),
        "dc_unique_segments": int(observations["segment_id"].nunique()),
        "dc_repeated_segments": repeated_segments,
        "dc_training_pairs": len(pairs),
        "dc_probable_treatment_pairs_excluded": len(probable_treatments),
        "dc_target_year_counts": {
            str(int(year)): int(count)
            for year, count in pairs["target_year"].value_counts().sort_index().items()
        },
        "san_diego_external_pairs": len(external),
        "san_diego_probable_treatment_pairs_excluded": len(external_treatments),
        "missing_fraction_training": {
            column: float(value)
            for column, value in pairs.isna().mean().round(6).items()
        },
    }
    (PROCESSED_DIR / "data_quality.json").write_text(
        json.dumps(audit, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(audit, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

