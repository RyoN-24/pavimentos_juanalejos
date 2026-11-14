"""Funciones compartidas para validación y evaluación del modelo PCI."""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error


def annual_delta_to_pci(
    pci_current: np.ndarray, annual_delta: np.ndarray, horizon_years: np.ndarray
) -> np.ndarray:
    """Convierte una tasa anual predicha en PCI futuro dentro de 0 a 100."""
    values = np.asarray(pci_current, dtype=float) + np.asarray(
        annual_delta, dtype=float
    ) * np.asarray(horizon_years, dtype=float)
    return np.clip(values, 0.0, 100.0)


def group_fold_indices(
    frame: pd.DataFrame, n_splits: int = 3, random_state: int = 42
) -> list[tuple[np.ndarray, np.ndarray]]:
    """Genera pliegues donde ningún segmento aparece en ambos lados."""
    splitter = GroupKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    groups = frame["segment_id"].astype(str).to_numpy()
    dummy = np.zeros((len(frame), 1), dtype=float)
    return list(splitter.split(dummy, groups=groups))


def regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float | int]:
    """Calcula métricas principales de precisión y sesgo."""
    truth = np.asarray(y_true, dtype=float)
    prediction = np.asarray(y_pred, dtype=float)
    return {
        "n": int(len(truth)),
        "mae": float(mean_absolute_error(truth, prediction)),
        "rmse": float(root_mean_squared_error(truth, prediction)),
        "r2": float(r2_score(truth, prediction)),
        "bias": float(np.mean(prediction - truth)),
    }

