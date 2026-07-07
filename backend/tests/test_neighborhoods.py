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


def test_neighborhoods_geojson_filtered_by_city(client) -> None:
    response = client.get("/api/neighborhoods/geojson", params={"city": "sf"})
    assert response.status_code == 200
    body = response.json()
    assert body["type"] == "FeatureCollection"
    assert len(body["features"]) == 41
    feature = body["features"][0]
    assert feature["type"] == "Feature"
    assert feature["geometry"]["type"] in ("Polygon", "MultiPolygon")
    assert feature["properties"]["city"] == "sf"
    assert feature["properties"]["incident_count"] > 0


def test_neighborhoods_geojson_all_cities(client) -> None:
    response = client.get("/api/neighborhoods/geojson")
    assert response.status_code == 200
    assert len(response.json()["features"]) == 380


def test_neighborhoods_geojson_filtered_by_category(client) -> None:
    response = client.get("/api/neighborhoods/geojson", params={"city": "chicago", "category": "homicide"})
    assert response.status_code == 200
    features = response.json()["features"]
    assert len(features) == 77  # every Chicago neighborhood is present, most with 0 homicides
    total = sum(f["properties"]["incident_count"] for f in features)
    assert 0 < total < 2000  # sanity check -- homicide is a rare category, see docs/PIPELINE.md
