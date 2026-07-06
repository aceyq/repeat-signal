"""
Test fixtures. These tests run against the local dev database directly (not an
isolated test database) -- a deliberate scope simplification for this project,
documented in backend/README.md. Run `alembic upgrade head` and `python seed.py`
before running pytest.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)
