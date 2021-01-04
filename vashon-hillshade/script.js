mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ";
var map = new mapboxgl.Map({
  container: "map",
  zoom: 14.1,
  center: [-122.4599, 47.4473],
  pitch: 85,
  bearing: 80,
  hash: true,
  transformRequest: (r, t) => {
    if (t === "Tile" && /s-vashon-earth-bumps\/\d+\/\d+\/\d+/.test(r)) {
      return { url: r.replace("webp", "pngraw") };
    }
  },
  style: {
    version: 8,
    sources: {
      hs: {
        type: "raster-dem",
        url: "mapbox://dnomadb.s-vashon-earth-bumps"
      }
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "white"
        }
      },
      {
        id: "hs",
        source: "hs",
        type: "hillshade"
      }
    ]
  }
});

map.on("load", function () {
  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://dnomadb.s-vashon-earth-bumps",
    tileSize: 512
  });
  // add the DEM source as a terrain layer with exaggerated height
  map.setTerrain({ source: "mapbox-dem", exaggeration: 0.75 });

  // add a sky layer that will show when the map is highly pitched
  map.addLayer({
    id: "sky",
    type: "sky",
    paint: {
      "sky-type": "atmosphere",
      "sky-atmosphere-sun": [0.0, 0.0],
      "sky-atmosphere-sun-intensity": 15
    }
  });
});
