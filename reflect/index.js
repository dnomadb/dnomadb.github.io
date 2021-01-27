const syncMove = require('@mapbox/mapbox-gl-sync-move');

mapboxgl.accessToken = 'pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ';
const A = new mapboxgl.Map({
    container: 'map-A',
    style: 'mapbox://styles/dnomadb/ckkeptams00lg18pkvkaj1i6g',
    center: [-120, 40],
    zoom: 9,
    hash: true
});

const B = new mapboxgl.Map({
    container: 'map-B',
    style: 'mapbox://styles/dnomadb/ckkeptams00lg18pkvkaj1i6g',
    center: [-120, 40],
    zoom: 9,
    hash: true
});

syncMove(A, B);
