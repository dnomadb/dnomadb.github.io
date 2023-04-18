const syncMove = require("@mapbox/mapbox-gl-sync-move");

const url = new URL(window.location);
const styleA = url.searchParams.get("styleA") || "mapbox://styles/mapbox/streets-v11";
const styleB = url.searchParams.get("styleB") || "mapbox://styles/mapbox/outdoors-v11";

if (!url.searchParams.get("styleA") || !url.searchParams.get("styleB")) {
  url.searchParams.set("styleA", styleA);
  url.searchParams.set("styleB", styleB);
  window.location.search = url.searchParams.toString();
}

mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjbGdsOHRpYWcxbWxwM3NueWYwYWYwbms0In0.zb8hlW2-BNebPuQ2hhiAuw";
const A = new mapboxgl.Map({
  container: "map-A",
  style: styleA,
  center: [-120, 40],
  zoom: 9,
  hash: true,
});


const B = new mapboxgl.Map({
  container: "map-B",
  style: styleB,
  center: [-120, 40],
  zoom: 9,
  hash: true,
});

syncMove(A, B);
