var tileSize,
    locationHash,
    everyOther = true;


var loadHash = window.location.hash.replace('#', '').split('/');

if (loadHash.length != 3) {
    loadHash = [37.79570, -122.39321, 18];
    history.pushState(null, null, '#' + loadHash[0] + '/' + loadHash[1] + '/' + loadHash[2])
}

var map = L.map('map_canvas', {
    center: [loadHash[0], loadHash[1]],
    zoom: loadHash[2],
    maxZoom: 20,
    worldCopyJump: true
});

var tiles = new L.TileLayer.Canvas({
    unloadInvisibleTiles: true,
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});

var cursMark;

map.once('mouseover', function (e) {
    cursMark = L.circleMarker(e.latlng, { radius: 5, color: 'red' }).addTo(map);

});

var worker = new Worker('radial-search.js');

worker.addEventListener('message', function (response) {
    // Take the 'edge' response, set the cursor
    cursMark.setLatLng(response.data);
}, false);

map.on('mousemove', function (e) {
    // Run the radial search on every other mouse event
    if (everyOther == true) {
        var moveEvent = {
            'data': {
                'lat': e.latlng.lat,
                'lng': e.latlng.lng,
                'zoom': map.getZoom()
            },
            'type': 'mouseevent'
        }
        worker.postMessage(moveEvent);
        everyOther = false
    }
    else {
        everyOther = true
    }
})

map.on('moveend', function () {
    // Set url with lat/lng/zoom
    locationHash = '#' + '' + map.getCenter().toString().replace('LatLng(', '').replace(')', '').replace(', ', '/') + '/' + map.getZoom();
    history.replaceState(null, null, locationHash);
});


tiles.on('tileunload', function (e) {
    //Send tile unload data to worker to delete un-needed pixel data
    worker.postMessage({ 'data': e.tile._tilePoint.id, 'type': 'tileunload' })
});

tiles.drawTile = function (canvas, tile, zoom) {
    tileSize = this.options.tileSize;

    var context = canvas.getContext('2d'),
        imageObj = new Image(),
        tileUID = '' + zoom + '/' + tile.x + '/' + tile.y;

    // To access / delete tiles later
    tile.id = tileUID;

    imageObj.onload = function () {
        // Draw Image tile
        context.drawImage(imageObj, 0, 0);
        //put image data (sum of three bands) into array for worker
        var imageData = context.getImageData(0, 0, tileSize, tileSize),
            dataArray = new Uint16Array(65536);

        // counter for flat array
        var counter = 0;
        for (y = 0; y < tileSize; y++) {
            for (x = 0; x < tileSize; x++) {
                var tDataVal = (imageData.data[counter] + imageData.data[counter + 1] + imageData.data[counter + 2]);
                dataArray[counter / 4] = (tDataVal);
                counter += 4
            }
        }

        context.drawImage(imageObj, 0, 0);

        //Send pixel (in this case, sum of all three bands) data to worker
        worker.postMessage({ 'data': { 'tileUID': tileUID, 'array': dataArray }, 'type': 'tiledata' }, [dataArray.buffer]);
    }

    // Source of image tile
    imageObj.crossOrigin = 'Anonymous';
    imageObj.src = `https://b.tiles.mapbox.com/v4/mapbox.satellite/${zoom}/${tile.x}/${tile.y}.webp?access_token=pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjbGdsOHRpYWcxbWxwM3NueWYwYWYwbms0In0.zb8hlW2-BNebPuQ2hhiAuw`

}

tiles.addTo(map);
