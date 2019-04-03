const syncMove = require('@mapbox/mapbox-gl-sync-move');

mapboxgl.accessToken = 'pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ';
const A = new mapboxgl.Map({
    container: 'map-A',
    style: 'mapbox://styles/dnomadb/cju1e509819t31fqik5tkprmn',
    center: [-120, 40],
    zoom: 9
});

const B = new mapboxgl.Map({
    container: 'map-B',
    style: 'mapbox://styles/dnomadb/cju1e509819t31fqik5tkprmn',
    center: [-120, 40],
    zoom: 9
});

syncMove(A, B);
