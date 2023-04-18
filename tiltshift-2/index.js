const syncMove = require('@mapbox/mapbox-gl-sync-move');

mapboxgl.accessToken = 'pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjbGdsOHRpYWcxbWxwM3NueWYwYWYwbms0In0.zb8hlW2-BNebPuQ2hhiAuw';
const A = new mapboxgl.Map({
    container: 'map-A',
    style: 'mapbox://styles/dnomadb/cju1el5dt14ff1fthtpj0fqli?fresh=true',
    center: [-122.4194, 37.7749],
    zoom: 10,
    hash: true
});

const B = new mapboxgl.Map({
    container: 'map-B',
    style: 'mapbox://styles/dnomadb/cju1el5dt14ff1fthtpj0fqli?fresh=true',
    center: [-122.4194, 37.7749],
    zoom: 10
});


A.on("load", () => {
  const mapcont = A.getContainer();
  let height = mapcont.offsetHeight;

  window.setInterval(() => {
    const offset = 50;
    const ctr = (Math.random() * 0.5 + 0.25) * 100;
    const a = Math.max(0, ctr - offset);
    const b = Math.max(0, ctr - offset / 2);
    const c = Math.min(height, ctr + offset / 2);
    const d = Math.min(height, ctr + offset);

    mapcont.setAttribute("style", `-webkit-mask-box-image: -webkit-linear-gradient(black ${a}%, transparent ${b}%, transparent ${c}%, black ${d}%)`);
  }, 10);
})


syncMove(A, B);
