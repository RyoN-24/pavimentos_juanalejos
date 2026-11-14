"""Entrena y compara modelos para estimar PCI futuro sin rehabilitación mayor."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor

from dataset import temporal_holdout
from modeling import annual_delta_to_pci, group_fold_indices, regression_metrics


ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
MODEL_DIR = ROOT / "models"
REPORT_DIR = ROOT / "reports"
FEATURES = [
    "pci_current",
    "pci_previous",
    "previous_annual_delta",
    "years_since_previous",
    "segment_length",
]
TARGET = "target_annual_delta"
RANDOM_STATE = 42


def build_estimators() -> dict[str, Pipeline]:
    return {
        "linear_regression": Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median", add_indicator=True)),
                ("scaler", StandardScaler()),
                ("model", LinearRegression()),
            ]
        ),
        "random_forest": Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median", add_indicator=True)),
                (
                    "model",
                    RandomForestRegressor(
                        n_estimators=300,
                        max_depth=16,
                        min_samples_leaf=5,
                        max_features=0.8,
                        n_jobs=-1,
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),
        "xgboost": Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median", add_indicator=True)),
                (
                    "model",
                    XGBRegressor(
                        objective="reg:squarederror",
                        tree_method="hist",
                        n_estimators=350,
                        learning_rate=0.04,
                        max_depth=5,
                        min_child_weight=8,
                        subsample=0.8,
                        colsample_bytree=0.8,
                        reg_lambda=2.0,
                        n_jobs=4,
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),
    }


def future_predictions(frame: pd.DataFrame, annual_delta: np.ndarray) -> np.ndarray:
    return annual_delta_to_pci(
        frame["pci_current"].to_numpy(),
        annual_delta,
        frame["prediction_horizon_years"].to_numpy(),
    )


def evaluate_frame(frame: pd.DataFrame, annual_delta: np.ndarray) -> dict:
    prediction = future_predictions(frame, annual_delta)
    metrics = regression_metrics(frame["pci_future"].to_numpy(), prediction)
    metrics["annual_delta_mae"] = float(
        np.mean(np.abs(annual_delta - frame[TARGET].to_numpy()))
    )
    return metrics


def cross_validate_models(train: pd.DataFrame, estimators: dict[str, Pipeline]) -> tuple[dict, list[dict]]:
    folds = group_fold_indices(train, n_splits=3, random_state=RANDOM_STATE)
    details: list[dict] = []
    summary: dict[str, dict] = {}

    baseline_scores = []
    for fold_number, (_, validation_idx) in enumerate(folds, start=1):
        validation = train.iloc[validation_idx]
        metrics = regression_metrics(
            validation["pci_future"].to_numpy(), validation["pci_current"].to_numpy()
        )
        baseline_scores.append(metrics)
        details.append({"model": "persistence", "fold": fold_number, **metrics})
    summary["persistence"] = _summarize_folds(baseline_scores)

    for name, estimator in estimators.items():
        fold_scores = []
        for fold_number, (train_idx, validation_idx) in enumerate(folds, start=1):
            fold_train = train.iloc[train_idx]
            fold_validation = train.iloc[validation_idx]
            fitted = clone(estimator).fit(fold_train[FEATURES], fold_train[TARGET])
            annual_delta = fitted.predict(fold_validation[FEATURES])
            metrics = evaluate_frame(fold_validation, annual_delta)
            fold_scores.append(metrics)
            details.append({"model": name, "fold": fold_number, **metrics})
        summary[name] = _summarize_folds(fold_scores)
    return summary, details


def _summarize_folds(scores: list[dict]) -> dict:
    numeric_keys = [key for key in scores[0] if key != "n"]
    result = {"folds": len(scores), "n_total": int(sum(score["n"] for score in scores))}
    for key in numeric_keys:
        values = np.array([score[key] for score in scores], dtype=float)
        result[f"{key}_mean"] = float(values.mean())
        result[f"{key}_std"] = float(values.std(ddof=0))
    return result


def write_data_dictionary() -> None:
    rows = [
        ("segment_id", "Identificador longitudinal normalizado del tramo", "texto"),
        ("observation_year", "Año de la medición usada como entrada", "año"),
        ("target_year", "Año de la medición objetivo", "año"),
        ("prediction_horizon_years", "Tiempo entre entrada y objetivo", "años"),
        ("pci_current", "PCI disponible al efectuar el pronóstico", "0 a 100"),
        ("pci_previous", "PCI de la medición previa del mismo tramo", "0 a 100"),
        ("previous_annual_delta", "Cambio anual observado antes de la entrada", "puntos PCI/año"),
        ("years_since_previous", "Intervalo respecto de la medición previa", "años"),
        ("segment_length", "Longitud geométrica reportada por la fuente", "metros"),
        ("pci_future", "PCI observado en el año objetivo", "0 a 100"),
        ("target_annual_delta", "Cambio anual de PCI que aprende el modelo", "puntos PCI/año"),
    ]
    pd.DataFrame(rows, columns=["variable", "definition", "unit_or_domain"]).to_csv(
        REPORT_DIR / "data_dictionary.csv", index=False
    )


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    pairs = pd.read_csv(PROCESSED_DIR / "dc_training_pairs.csv")
    external = pd.read_csv(PROCESSED_DIR / "san_diego_external_pairs.csv")
    train, temporal_test = temporal_holdout(pairs, target_year=2024)
    estimators = build_estimators()

    cv_summary, cv_details = cross_validate_models(train, estimators)
    eligible = {name: values for name, values in cv_summary.items() if name in estimators}
    selected_name = min(eligible, key=lambda name: eligible[name]["mae_mean"])

    temporal_metrics = {
        "persistence": regression_metrics(
            temporal_test["pci_future"], temporal_test["pci_current"]
        )
    }
    external_metrics = {
        "persistence": regression_metrics(external["pci_future"], external["pci_current"])
    }
    fitted_models = {}
    temporal_predictions = temporal_test[
        ["segment_id", "observation_year", "target_year", "pci_current", "pci_future"]
    ].copy()
    external_predictions = external[
        ["segment_id", "observation_year", "target_year", "pci_current", "pci_future"]
    ].copy()
    temporal_predictions["prediction_persistence"] = temporal_test["pci_current"].to_numpy()
    external_predictions["prediction_persistence"] = external["pci_current"].to_numpy()

    for name, estimator in estimators.items():
        fitted = clone(estimator).fit(train[FEATURES], train[TARGET])
        fitted_models[name] = fitted
        temporal_rate = fitted.predict(temporal_test[FEATURES])
        external_rate = fitted.predict(external[FEATURES])
        temporal_metrics[name] = evaluate_frame(temporal_test, temporal_rate)
        external_metrics[name] = evaluate_frame(external, external_rate)
        temporal_predictions[f"prediction_{name}"] = future_predictions(
            temporal_test, temporal_rate
        )
        external_predictions[f"prediction_{name}"] = future_predictions(external, external_rate)

    selected_model = clone(estimators[selected_name]).fit(pairs[FEATURES], pairs[TARGET])
    bundle = {
        "model": selected_model,
        "model_name": selected_name,
        "features": FEATURES,
        "target": TARGET,
        "prediction_rule": "clip(pci_current + annual_delta * horizon_years, 0, 100)",
        "training_scope": "DDOT asphalt segments; probable major treatments excluded",
        "training_rows": len(pairs),
    }
    joblib.dump(bundle, MODEL_DIR / "pci_model.joblib")

    temporal_predictions.to_csv(REPORT_DIR / "temporal_test_predictions.csv", index=False)
    external_predictions.to_csv(REPORT_DIR / "external_validation_predictions.csv", index=False)
    pd.DataFrame(cv_details).to_csv(REPORT_DIR / "cross_validation_folds.csv", index=False)
    write_data_dictionary()

    results = {
        "selected_model": selected_name,
        "selection_criterion": "lowest grouped cross-validation MAE",
        "features": FEATURES,
        "training_rows": len(train),
        "training_segments": int(train["segment_id"].nunique()),
        "temporal_test_rows_2024": len(temporal_test),
        "external_validation_rows_san_diego": len(external),
        "grouped_cross_validation": cv_summary,
        "temporal_test_2024": temporal_metrics,
        "external_validation_san_diego_2016_2023": external_metrics,
    }
    (REPORT_DIR / "metrics.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    reloaded = joblib.load(MODEL_DIR / "pci_model.joblib")
    smoke = temporal_test.iloc[[0]].copy()
    smoke_rate = reloaded["model"].predict(smoke[reloaded["features"]])
    smoke_pci = future_predictions(smoke, smoke_rate)
    if not (0 <= smoke_pci[0] <= 100):
        raise RuntimeError("La predicción de humo quedó fuera del dominio PCI")

    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

