import sys
import unittest
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from dataset import (
    build_segment_key,
    build_supervised_pairs,
    filter_probable_treatments,
    normalize_dc_frame,
    normalize_sandiego_pairs,
    temporal_holdout,
)


class DatasetTests(unittest.TestCase):
    def test_segment_key_is_stable_for_numeric_text_variants(self):
        a = build_segment_key("11000102", 0, 100.0)
        b = build_segment_key(" 11000102 ", 0.0, "100.000000")
        self.assertEqual(a, b)

    def test_build_pairs_calculates_annual_change_and_lags(self):
        observations = pd.DataFrame(
            {
                "segment_id": ["A", "A", "A", "B", "B"],
                "year": [2019, 2020, 2022, 2020, 2021],
                "pci": [80.0, 74.0, 64.0, 50.0, 55.0],
                "segment_length": [100.0] * 5,
                "from_measure": [0.0] * 5,
                "to_measure": [100.0] * 5,
            }
        )

        pairs = build_supervised_pairs(observations)

        first_a = pairs[(pairs.segment_id == "A") & (pairs.target_year == 2020)].iloc[0]
        second_a = pairs[(pairs.segment_id == "A") & (pairs.target_year == 2022)].iloc[0]
        self.assertEqual(first_a.target_annual_delta, -6.0)
        self.assertEqual(second_a.target_annual_delta, -5.0)
        self.assertTrue(pd.isna(first_a.pci_previous))
        self.assertEqual(second_a.pci_previous, 80.0)
        self.assertEqual(second_a.previous_annual_delta, -6.0)

    def test_temporal_holdout_reserves_target_year(self):
        pairs = pd.DataFrame(
            {
                "segment_id": ["A", "B", "C"],
                "target_year": [2023, 2024, 2024],
            }
        )

        train, test = temporal_holdout(pairs, target_year=2024)

        self.assertEqual(train.target_year.tolist(), [2023])
        self.assertEqual(sorted(test.segment_id.tolist()), ["B", "C"])

    def test_normalize_dc_frame_accepts_case_variants(self):
        raw = pd.DataFrame(
            {
                "RouteID": ["R-1", "R-2"],
                "FromMeasure": [0, 10],
                "ToMeasure": [10, 20],
                "PCI": [80, 120],
                "Shape__Length": [50.5, 75.0],
                "SURFACE": ["AC", "PCC"],
            }
        )

        result = normalize_dc_frame(raw, year=2023)

        self.assertEqual(len(result), 1)
        self.assertEqual(result.iloc[0].segment_id, "R-1|0|10")
        self.assertEqual(result.iloc[0].surface, "AC")

    def test_normalize_sandiego_pairs_uses_only_complete_matches(self):
        old = pd.DataFrame({"seg_id": ["A", "B"], "pci": [80, 60]})
        new = pd.DataFrame({"seg_id": ["A", "B"], "pci": [66, None]})

        result = normalize_sandiego_pairs(old, new, start_year=2016, end_year=2023)

        self.assertEqual(len(result), 1)
        self.assertEqual(result.iloc[0].target_annual_delta, -2.0)
        self.assertEqual(result.iloc[0].prediction_horizon_years, 7)

    def test_filter_probable_treatments_removes_large_pci_increases(self):
        pairs = pd.DataFrame(
            {
                "pci_current": [60.0, 60.0, 60.0],
                "pci_future": [63.0, 65.0, 80.0],
            }
        )

        kept, probable_treatments = filter_probable_treatments(pairs, threshold=5.0)

        self.assertEqual(len(kept), 2)
        self.assertEqual(len(probable_treatments), 1)


if __name__ == "__main__":
    unittest.main()

