"""
Runs the full data pipeline end to end: fetch -> clean/normalize -> geospatial join
-> aggregate. This is the single command a reader (or interviewer) can run to
reproduce every processed dataset in data/processed/ from scratch.

Usage: python scripts/run_pipeline.py
"""

import time

import build_aggregates
import clean_normalize
import fetch_incidents
import geospatial_join


def run_step(label: str, module) -> None:
    print(f"\n{'=' * 60}\n{label}\n{'=' * 60}")
    start = time.time()
    module.main()
    print(f"[{label} finished in {time.time() - start:.1f}s]")


def main() -> None:
    run_step("STEP 1/4: Fetching raw incident data", fetch_incidents)
    run_step("STEP 2/4: Cleaning & normalizing into shared schema", clean_normalize)
    run_step("STEP 3/4: Geospatial join to neighborhoods", geospatial_join)
    run_step("STEP 4/4: Building monthly aggregate tables", build_aggregates)
    print("\nPipeline complete. See data/processed/ for output files.")


if __name__ == "__main__":
    main()
