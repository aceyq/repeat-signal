"""
Downloads the three cities' neighborhood boundary GeoJSON files into data/external/.

Run standalone: python scripts/fetch_boundaries.py
These files are small and stable (city boundaries don't change often), so they're
committed to the repo rather than re-fetched by the main pipeline on every run.
"""

import requests

from config import (
    CHICAGO_BOUNDARIES_ENDPOINT,
    CHICAGO_BOUNDARIES_FILE,
    NYC_BOUNDARIES_ENDPOINT,
    NYC_BOUNDARIES_FILE,
    SF_BOUNDARIES_ENDPOINT,
    SF_BOUNDARIES_FILE,
)

BOUNDARIES = [
    ("Chicago community areas", CHICAGO_BOUNDARIES_ENDPOINT, CHICAGO_BOUNDARIES_FILE),
    ("NYC neighborhood tabulation areas", NYC_BOUNDARIES_ENDPOINT, NYC_BOUNDARIES_FILE),
    ("SF analysis neighborhoods", SF_BOUNDARIES_ENDPOINT, SF_BOUNDARIES_FILE),
]


def fetch_boundary(label: str, endpoint: str, dest_path) -> None:
    print(f"Fetching {label} from {endpoint} ...")
    response = requests.get(endpoint, params={"$limit": 1000}, timeout=60)
    response.raise_for_status()
    dest_path.write_bytes(response.content)
    print(f"  saved to {dest_path} ({dest_path.stat().st_size:,} bytes)")


def main() -> None:
    for label, endpoint, dest_path in BOUNDARIES:
        fetch_boundary(label, endpoint, dest_path)


if __name__ == "__main__":
    main()
