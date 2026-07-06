EXPECTED_CITIES = {"chicago", "nyc", "sf"}


def test_list_cities(client) -> None:
    response = client.get("/api/cities")
    assert response.status_code == 200
    cities = response.json()
    assert {c["city"] for c in cities} == EXPECTED_CITIES
    for city in cities:
        assert city["incident_count"] > 0
        assert city["date_range_start"] <= city["date_range_end"]


def test_list_categories(client) -> None:
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) == 21  # see scripts/category_mapping.py
    assert all(c["incident_count"] > 0 for c in categories)


def test_summary(client) -> None:
    response = client.get("/api/summary")
    assert response.status_code == 200
    summary = response.json()
    assert summary["total_incidents"] > 0
    assert len(summary["cities"]) == 3
    assert sum(c["incident_count"] for c in summary["cities"]) == summary["total_incidents"]
