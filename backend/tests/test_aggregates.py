def test_list_aggregates_no_filter(client) -> None:
    response = client.get("/api/aggregates")
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) > 0
    assert len(rows) <= 5000  # default limit


def test_list_aggregates_filtered_by_city(client) -> None:
    response = client.get("/api/aggregates", params={"city": "chicago", "limit": 20000})
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) > 0
    assert all(r["city"] == "chicago" for r in rows)


def test_list_aggregates_filtered_by_category(client) -> None:
    response = client.get("/api/aggregates", params={"category": "homicide", "limit": 20000})
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) > 0
    assert all(r["category"] == "homicide" for r in rows)


def test_list_aggregates_date_range(client) -> None:
    response = client.get(
        "/api/aggregates",
        params={"start_date": "2025-01-01", "end_date": "2025-01-31", "limit": 20000},
    )
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) > 0
    assert all(r["year_month"] == "2025-01-01" for r in rows)


def test_list_aggregates_respects_limit(client) -> None:
    response = client.get("/api/aggregates", params={"limit": 5})
    assert response.status_code == 200
    assert len(response.json()) == 5
