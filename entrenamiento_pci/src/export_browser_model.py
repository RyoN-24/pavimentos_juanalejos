"""Exporta el pipeline XGBoost a un formato JSON ejecutable en el navegador."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from modeling import annual_delta_to_pci


ROOT = Path(__file__).resolve().parents[1]
APP_ROOT = ROOT.parent
MODEL_PATH = ROOT / "models" / "pci_model.joblib"
OUTPUT_PATH = APP_ROOT / "modelos" / "pci-xgboost-browser.json"
PARITY_PATH = APP_ROOT / "tests" / "fixtures" / "pci-model-parity.json"


def browser_payload(bundle: dict) -> dict:
    pipeline = bundle["model"]
    imputer = pipeline.named_steps["imputer"]
    estimator = pipeline.named_steps["model"]
    booster = estimator.get_booster()
    config = json.loads(booster.save_config())
    base_score = float(
        config["learner"]["learner_model_param"]["base_score"].strip("[]")
    )
    trees = [json.loads(tree) for tree in booster.get_dump(dump_format="json")]
    return {
        "schemaVersion": 1,
        "modelName": bundle["model_name"],
        "modelVersion": "ddot-2019-2024-v1",
        "task": bundle["target"],
        "predictionRule": bundle["prediction_rule"],
        "features": bundle["features"],
        "imputer": {
            "strategy": "median",
            "statistics": [float(value) for value in imputer.statistics_],
            "indicatorFeatures": [int(value) for value in imputer.indicator_.features_],
        },
        "booster": {"baseScore": base_score, "trees": trees},
        "training": {
            "source": "DDOT Pavement Condition Index, Washington D.C.",
            "years": "2019-2024",
            "rows": int(bundle["training_rows"]),
            "scope": bundle["training_scope"],
        },
        "validation": {
            "temporal2024": {"mae": 6.324, "rmse": 8.317, "r2": 0.750},
            "externalSanDiego": {"mae": 17.730, "rmse": 21.501, "r2": 0.306},
        },
    }


def parity_cases(bundle: dict) -> list[dict]:
    examples = [
        ("historial_completo", [82.0, 88.0, -3.0, 2.0, 120.0], 3.0),
        ("sin_historial", [72.0, np.nan, np.nan, np.nan, 85.0], 5.0),
        ("pci_alto", [95.0, 92.0, 1.5, 2.0, 240.0], 2.0),
    ]
    pipeline = bundle["model"]
    features = bundle["features"]
    output = []
    for name, values, horizon in examples:
        frame = pd.DataFrame([values], columns=features)
        annual_delta = float(pipeline.predict(frame)[0])
        pci_future = float(
            annual_delta_to_pci(
                np.array([values[0]]), np.array([annual_delta]), np.array([horizon])
            )[0]
        )
        input_data = {
            "pciCurrent": values[0],
            "horizonYears": horizon,
            "segmentLength": values[4],
        }
        if not np.isnan(values[1]):
            input_data.update(
                {
                    "pciPrevious": values[1],
                    "previousAnnualDelta": values[2],
                    "yearsSincePrevious": values[3],
                }
            )
        output.append(
            {
                "name": name,
                "input": input_data,
                "expectedAnnualDelta": annual_delta,
                "expectedPciFuture": pci_future,
            }
        )
    return output


def main() -> None:
    bundle = joblib.load(MODEL_PATH)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PARITY_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(browser_payload(bundle), ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    PARITY_PATH.write_text(
        json.dumps(parity_cases(bundle), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Modelo web: {OUTPUT_PATH}")
    print(f"Casos de paridad: {PARITY_PATH}")


if __name__ == "__main__":
    main()
