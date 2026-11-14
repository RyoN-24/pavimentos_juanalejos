"""Descarga reproducible de fuentes oficiales de PCI urbano."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
DC_SERVICE = "https://rh.dcgis.dc.gov/dcgis/rest/services/DDOT/PavementConditionIndex/FeatureServer"
DC_LAYERS = {2019: 6, 2020: 8, 2021: 10, 2022: 12, 2023: 13, 2024: 14}
SD_URLS = {
    2016: "https://seshat.datasd.org/pavement_condition_assessment/pavement_condition_assessment_2016_datasd.csv",
    2023: "https://seshat.datasd.org/pavement_condition_assessment/pavement_condition_assessment_2023_datasd.csv",
}


def _read_json(url: str) -> dict:
    request = Request(url, headers={"User-Agent": "UPN-pavement-thesis/1.0"})
    with urlopen(request, timeout=120) as response:
        return json.load(response)


def _post_json(url: str, params: dict[str, str]) -> dict:
    payload = urlencode(params).encode("utf-8")
    request = Request(
        url,
        data=payload,
        headers={
            "User-Agent": "UPN-pavement-thesis/1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    with urlopen(request, timeout=120) as response:
        return json.load(response)


def _read_bytes(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "UPN-pavement-thesis/1.0"})
    with urlopen(request, timeout=120) as response:
        return response.read()


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def download_arcgis_layer(layer_id: int, destination: Path) -> dict:
    """Descarga todos los atributos mediante lotes de ObjectID."""
    layer_url = f"{DC_SERVICE}/{layer_id}"
    metadata = _read_json(f"{layer_url}?f=json")
    ids_url = f"{layer_url}/query?{urlencode({'where': '1=1', 'returnIdsOnly': 'true', 'f': 'json'})}"
    object_ids = _read_json(ids_url).get("objectIds", [])
    if not object_ids:
        raise RuntimeError(f"La capa {layer_id} no devolvió ObjectID")

    rows: list[dict] = []
    for start in range(0, len(object_ids), 500):
        batch = object_ids[start : start + 500]
        params = {
            "objectIds": ",".join(str(value) for value in batch),
            "outFields": "*",
            "returnGeometry": "false",
            "f": "json",
        }
        payload = _post_json(f"{layer_url}/query", params)
        if "error" in payload:
            raise RuntimeError(f"Error ArcGIS en capa {layer_id}: {payload['error']}")
        rows.extend(feature["attributes"] for feature in payload.get("features", []))

    frame = pd.DataFrame(rows)
    if len(frame) != len(object_ids):
        raise RuntimeError(
            f"Capa {layer_id}: se esperaban {len(object_ids)} filas y se recibieron {len(frame)}"
        )
    destination.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(destination, index=False)
    return {
        "source_url": layer_url,
        "layer_name": metadata.get("name"),
        "record_count": len(frame),
        "field_count": len(frame.columns),
        "sha256": _sha256(destination),
    }


def download_csv(url: str, destination: Path) -> dict:
    content = _read_bytes(url)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)
    frame = pd.read_csv(destination)
    return {
        "source_url": url,
        "record_count": len(frame),
        "field_count": len(frame.columns),
        "sha256": _sha256(destination),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Vuelve a descargar archivos existentes")
    args = parser.parse_args()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "downloaded_at_utc": datetime.now(timezone.utc).isoformat(),
        "sources": {},
    }

    for year, layer_id in DC_LAYERS.items():
        destination = RAW_DIR / f"dc_pci_{year}.csv"
        if args.force or not destination.exists():
            details = download_arcgis_layer(layer_id, destination)
        else:
            frame = pd.read_csv(destination)
            details = {
                "source_url": f"{DC_SERVICE}/{layer_id}",
                "record_count": len(frame),
                "field_count": len(frame.columns),
                "sha256": _sha256(destination),
                "reused_local_copy": True,
            }
        manifest["sources"][destination.name] = details
        print(f"{destination.name}: {details['record_count']} registros")

    for year, url in SD_URLS.items():
        destination = RAW_DIR / f"san_diego_pci_{year}.csv"
        if args.force or not destination.exists():
            details = download_csv(url, destination)
        else:
            frame = pd.read_csv(destination)
            details = {
                "source_url": url,
                "record_count": len(frame),
                "field_count": len(frame.columns),
                "sha256": _sha256(destination),
                "reused_local_copy": True,
            }
        manifest["sources"][destination.name] = details
        print(f"{destination.name}: {details['record_count']} registros")

    (RAW_DIR / "source_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()

