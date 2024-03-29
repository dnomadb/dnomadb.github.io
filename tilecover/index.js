const cover = require("@mapbox/tile-cover");
const tilebelt = require("@mapbox/tilebelt");
mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjbGdsOHRpYWcxbWxwM3NueWYwYWYwbms0In0.zb8hlW2-BNebPuQ2hhiAuw";
const map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/dark-v9", //hosted style id
  center: [-91.874, 42.76], // starting position
  zoom: 4, // starting zoom
  hash: true
});

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    line_string: true,
    point: true,
    trash: true
  }
});
map.addControl(draw);
let bbox = { type: "Feature", geometry: { type: "Polygon", coordinates: [] } };
let tileCover = {
  type: "Feature",
  geometry: { type: "Polygon", coordinates: [] }
};

const makeTileCover = (features, zoom) => {
  const tiles = [
    ...new Set(
      features.reduce((a, f) => {
        return a.concat(
          cover.indexes(f.geometry, { min_zoom: zoom, max_zoom: zoom })
        );
      }, [])
    )
  ];

  return [{
    type: "FeatureCollection",
    features: tiles.map(t => {
      return {
        type: "Feature",
        properties: {},
        geometry: tilebelt.tileToGeoJSON(tilebelt.quadkeyToTile(t))
      };
    })
  }, tiles.length];
};

const updateArea = e => {
  const data = draw.getAll();
  if (data.features.length > 0) {
    const searchParams = new URLSearchParams(window.location.search);
    let zoom = searchParams.get("zoom") || map.getZoom() + 2;
    zoom = parseInt(zoom);
    const area = Math.round(turf.area(data) * 1e-4) / 100;
    bbox = turf.bboxPolygon(turf.bbox(data));
    const bboxArea = Math.round(turf.area(bbox) * 1e-4) / 100;
    const [tileCover, nTiles] = makeTileCover(data.features, zoom);
    const tileCoverArea = Math.round(turf.area(tileCover) * 1e-4) / 100;
    map.getSource("tile-cover").setData(tileCover);
    map.getSource("bbox").setData(bbox);
    document.getElementById(
      "poly-area"
    ).innerHTML = `<p>Polygon area: <strong>${area} km²</strong></p>`;
    document.getElementById(
      "bbox-area"
    ).innerHTML = `<p>Bbox area: <strong>${bboxArea} km²</strong></p>`;
    document.getElementById(
      "tilecover-area"
    ).innerHTML = `<p>Tilecover area: <strong>${tileCoverArea} km²</strong></p>`;
    document.getElementById(
      "tilecover-count"
    ).innerHTML = `<p>Total tiles: <strong>${nTiles}</strong></p>`;
  } else {
    map
      .getSource("tile-cover")
      .setData({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [] }
      });
    map
      .getSource("bbox")
      .setData({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [] }
      });
    document.getElementById("poly-area").innerHTML = "";
    document.getElementById("bbox-area").innerHTML = "";
    document.getElementById("tilecover-area").innerHTML = "";
    document.getElementById("tilecover-count").innerHTML = "";
  }
};
map.on("draw.create", updateArea);
map.on("draw.delete", updateArea);
map.on("draw.update", updateArea);
map.on("load", () => {
  map.addSource("bbox", {
    type: "geojson",
    data: bbox
  });
  map.addLayer({
    id: "bbox",
    type: "line",
    source: "bbox",
    paint: {
      "line-color": "#F28474",
      "line-opacity": 0.75,
      "line-width": 5
    }
  });
  map.addSource("tile-cover", {
    type: "geojson",
    data: tileCover
  });
  map.addLayer({
    id: "tile-cover",
    type: "line",
    source: "tile-cover",
    paint: {
      "line-color": "#DFF16E",
      "line-opacity": 0.75,
      "line-width": 5
    }
  });
});
