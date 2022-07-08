import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Geometry } from "wkx";
import flatten from "@turf/flatten";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/dnomadb/cjsflvxej0n8s1gs1ze1fnkaj?fresh=true",
  zoom: 1.5,
  center: [0, 0],
  hash: true,
});

const url = new URL(window.location);

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    point: false,
    polygon: false,
    line_string: true,
    trash: true,
    combine_features: false,
    uncombine_features: false,
  },
  defaultMode: "draw_line_string",
  styles: [
    {
        "id": "gl-draw-line",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#fff",
          "line-opacity": 0.25,
          "line-dasharray": [0.2, 2],
          "line-width": 2
        }
    },
    {
        "id": "gl-draw-line-static",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#fff",
          "line-opacity": 0.75,
          "line-dasharray": [0.2, 2],
          "line-width": 2
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
      type: "MultiLineString",
      coordinates: features.map((f) => {
        return f.geometry.coordinates.map((c) => {
          return c.map((i) => {
            return Math.round(i * 1000) / 1000;
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
