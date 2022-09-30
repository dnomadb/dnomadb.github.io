const syncMove = require("@mapbox/mapbox-gl-sync-move");

mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ";
const A = new mapboxgl.Map({
  container: "map-A",
  style: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        url: "mapbox://mapbox.satellite",
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  },
  center: [-120, 40],
  zoom: 9,
  hash: true,
});

A.on("load", () => {
  A.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });
  // add the DEM source as a terrain layer with exaggerated height
  A.setTerrain({
    source: "mapbox-dem",
    exaggeration: ["interpolate", ["linear", 0.5], ["zoom"], 0, 10, 16, 10],
  });
});

const B = new mapboxgl.Map({
  container: "map-B",
  style: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        url: "mapbox://mapbox.satellite",
        tileSize: 4096,
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 22,
        paint: { "raster-resampling": "nearest" },
      },
    ],
  },
  center: [-120, 40],
  zoom: 9,
  hash: true,
});

B.on("load", () => {
  B.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });
  // add the DEM source as a terrain layer with exaggerated height
  B.setTerrain({
    source: "mapbox-dem",
    exaggeration: ["interpolate", ["linear", 0.5], ["zoom"], 0, 10, 16, 10],
  });
});

syncMove(A, B);
