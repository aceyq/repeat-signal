def test_monthly_trends_all_cities(client) -> None:
    response = client.get("/api/trends/monthly")
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) > 0
    assert {r["city"] for r in rows} == {"chicago", "nyc", "sf"}


def test_monthly_trends_excludes_current_partial_month(client) -> None:
    """The current calendar month is always incomplete at pull/query time -- e.g. San
    Francisco's real first days of a new month sat at ~430 incidents against a normal
    month of ~7,500-8,000, which would misleadingly look like a huge drop in a time
    series. See routers/trends.py."""
    from datetime import date

    current_month_start = date.today().replace(day=1).isoformat()
    response = client.get("/api/trends/monthly")
    assert response.status_code == 200
    rows = response.json()
    assert all(r["year_month"] < current_month_start for r in rows)


def test_monthly_trends_filtered_by_city(client) -> None:
    response = client.get("/api/trends/monthly", params={"city": "sf"})
    assert response.status_code == 200
    rows = response.json()
    assert all(r["city"] == "sf" for r in rows)
    assert sum(r["incident_count"] for r in rows) > 0


def test_monthly_trends_filtered_by_category(client) -> None:
    response = client.get("/api/trends/monthly", params={"city": "chicago", "category": "homicide"})
    assert response.status_code == 200
    rows = response.json()
    assert all(r["city"] == "chicago" for r in rows)
    assert 0 < sum(r["incident_count"] for r in rows) < 2000  # homicide is rare, see docs/PIPELINE.md


def test_category_trends_all_cities(client) -> None:
    response = client.get("/api/trends/categories")
    assert response.status_code == 200
    rows = response.json()
    # Up to 3 cities x 21 shared categories (scripts/category_mapping.py), but a rare
    # category can have zero incidents for a given city in this window, in which case
    # no aggregate row exists for that combination at all -- so this is an upper bound,
    # not an exact count.
    assert 0 < len(rows) <= 3 * 21
    total = sum(r["incident_count"] for r in rows)
    assert total == 1652117  # matches docs/PIPELINE.md total


def test_category_trends_filtered_by_city(client) -> None:
    response = client.get("/api/trends/categories", params={"city": "nyc"})
    assert response.status_code == 200
    rows = response.json()
    assert 0 < len(rows) <= 21
    assert all(r["city"] == "nyc" for r in rows)
