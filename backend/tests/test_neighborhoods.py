def test_list_neighborhoods(client) -> None:
    response = client.get("/api/neighborhoods")
    assert response.status_code == 200
    neighborhoods = response.json()
    assert len(neighborhoods) == 380  # 77 Chicago + 262 NYC + 41 SF, see docs/PIPELINE.md
    assert "geometry" not in neighborhoods[0]  # list view omits geometry


def test_list_neighborhoods_filtered_by_city(client) -> None:
    response = client.get("/api/neighborhoods", params={"city": "sf"})
    assert response.status_code == 200
    neighborhoods = response.json()
    assert len(neighborhoods) == 41
    assert all(n["city"] == "sf" for n in neighborhoods)


def test_get_neighborhood_detail_includes_geometry(client) -> None:
    listing = client.get("/api/neighborhoods", params={"city": "sf"}).json()
    neighborhood_id = listing[0]["id"]

    response = client.get(f"/api/neighborhoods/{neighborhood_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == neighborhood_id
    assert detail["geometry"]["type"] in ("Polygon", "MultiPolygon")


def test_get_neighborhood_detail_404(client) -> None:
    response = client.get("/api/neighborhoods/does_not_exist")
    assert response.status_code == 404
