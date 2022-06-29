import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Geometry } from "wkx";
import { features } from "process";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/dnomadb/cjsflvxej0n8s1gs1ze1fnkaj?fresh=true",
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
    polygon: false,
    line_string: true,
    trash: true,
    combine_features: false,
    uncombine_features: false,
  },
  defaultMode: "draw_line_string",
});

map.addControl(draw, "top-right");

map.on("load", () => {
  const constellationString = url.searchParams.get("constellation");
  if (constellationString) {
    const geom = Geometry.parseTwkb(Buffer.from(constellationString, "hex"));
    draw.set({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: geom.toGeoJSON(),
          properties: {},
        },
      ],
    });
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
