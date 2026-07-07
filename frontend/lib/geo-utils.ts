// Small GeoJSON helpers -- avoids pulling in a full turf.js dependency for one function.

type Position = [number, number];

function isPosition(value: unknown): value is Position {
  return Array.isArray(value) && value.length >= 2 && typeof value[0] === "number";
}

function walkCoordinates(coords: unknown, visit: (pos: Position) => void) {
  if (isPosition(coords)) {
    visit(coords);
    return;
  }
  if (Array.isArray(coords)) {
    for (const item of coords) walkCoordinates(item, visit);
  }
}

export type BBox = [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

export function computeBBox(featureCollection: GeoJSON.FeatureCollection): BBox | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  let found = false;

  for (const feature of featureCollection.features) {
    if (!feature.geometry || !("coordinates" in feature.geometry)) continue;
    walkCoordinates(feature.geometry.coordinates, ([lng, lat]) => {
      found = true;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });
  }

  return found ? [minLng, minLat, maxLng, maxLat] : null;
}
