import sys
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from modeling import annual_delta_to_pci, group_fold_indices, regression_metrics


class ModelingTests(unittest.TestCase):
    def test_annual_delta_to_pci_applies_horizon_and_clips_domain(self):
        current = np.array([80.0, 95.0, 10.0])
        annual_delta = np.array([-2.0, 3.0, -4.0])
        horizon = np.array([5.0, 3.0, 5.0])

        result = annual_delta_to_pci(current, annual_delta, horizon)

        np.testing.assert_allclose(result, [70.0, 100.0, 0.0])

    def test_group_folds_never_share_segments(self):
        frame = pd.DataFrame(
            {
                "segment_id": ["A", "A", "B", "B", "C", "C"],
                "pci_current": [80, 75, 60, 55, 40, 35],
            }
        )

        folds = group_fold_indices(frame, n_splits=3)

        for train_idx, test_idx in folds:
            train_groups = set(frame.iloc[train_idx].segment_id)
            test_groups = set(frame.iloc[test_idx].segment_id)
            self.assertTrue(train_groups.isdisjoint(test_groups))

    def test_regression_metrics_reports_expected_mae_and_rmse(self):
        result = regression_metrics(np.array([10.0, 20.0]), np.array([12.0, 18.0]))

        self.assertEqual(result["n"], 2)
        self.assertAlmostEqual(result["mae"], 2.0)
        self.assertAlmostEqual(result["rmse"], 2.0)
        self.assertAlmostEqual(result["bias"], 0.0)


if __name__ == "__main__":
    unittest.main()

