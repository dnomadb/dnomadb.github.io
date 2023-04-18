const syncMove = require('@mapbox/mapbox-gl-sync-move');

mapboxgl.accessToken = 'pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjbGdsOHRpYWcxbWxwM3NueWYwYWYwbms0In0.zb8hlW2-BNebPuQ2hhiAuw';
const A = new mapboxgl.Map({
    container: 'map-A',
    style: 'mapbox://styles/dnomadb/cju1e509819t31fqik5tkprmn',
    center: [-120, 40],
    zoom: 9,
    hash: true
});

A.on("load", () => {
  A.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14
  });
  // add the DEM source as a terrain layer with exaggerated height
  A.setTerrain({
    source: "mapbox-dem",
    exaggeration: [
      "interpolate",
      ["linear", 0.5],
      ["zoom"],
      0,
      4,
      16,
      1
    ]
  });
});


const B = new mapboxgl.Map({
    container: 'map-B',
    style: 'mapbox://styles/dnomadb/cju1e509819t31fqik5tkprmn',
    center: [-120, 40],
    zoom: 9,
    hash: true
});

B.on("load", () => {
  B.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14
  });
  // add the DEM source as a terrain layer with exaggerated height
  B.setTerrain({
    source: "mapbox-dem",
    exaggeration: [
      "interpolate",
      ["linear", 0.5],
      ["zoom"],
      0,
      4,
      16,
      1
    ]
  });
});

syncMove(A, B);
