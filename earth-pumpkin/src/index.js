import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Geometry } from "wkx";
import flatten from "@turf/flatten";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/dnomadb/cl513fn1e000014mn8e1lxj2g",
  zoom: 1.5,
  center: [0, 0],
  hash: true,
});

// const query = new URLSearchParams(window.location.search);

const url = new URL(window.location);

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    point: false,
    polygon: true,
    line_string: false,
    trash: true,
    combine_features: false,
    uncombine_features: false,
  },
  defaultMode: "draw_polygon",
  styles: [
    {
        "id": "gl-draw-polygon",
        "type": "fill",
        "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        "paint": {
          "fill-color": "#000",
        }
    },
    {
      "id": "gl-draw-line",
      "type": "line",
      "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#000",
        "line-width": 2
      }
    },
    {
        "id": "gl-draw-polygon-static",
        "type": "filldoma",
        "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        "paint": {
          "fill-color": "#000",
        }
    }
  ]
});

map.addControl(draw, "top-right");

map.on("load", () => {
  const constellationString = url.searchParams.get("constellation");
  if (constellationString) {
    const geom = Geometry.parseTwkb(Buffer.from(constellationString, "hex"));
    draw.set(flatten(geom.toGeoJSON()));
  }
});

const updateConstellation = () => {
  const features = draw.getAll().features;
  
  if (features.length) {
    const constellation = {
      type: "MultiPolygon",
      coordinates: features.map((f) => {
        return f.geometry.coordinates.map((part) => {
          return part.map((c) => {
            return c.map((i) => {
              return Math.round(i * 1000) / 1000;
            });
          });
        });
      }),
    };
    const cString = Geometry.parseGeoJSON(constellation)
      .toWkb()
      .toString("hex");

    url.searchParams.set(
      "constellation",
      Geometry.parseGeoJSON(constellation).toTwkb().toString("hex")
    );
    window.history.pushState(null, "", url.toString());
  } else {
    url.searchParams.delete("constellation");
    window.history.pushState(null, "", url.toString());
  }
};

map.on("draw.create", updateConstellation);
map.on("draw.update", updateConstellation);
map.on("draw.delete", updateConstellation);
