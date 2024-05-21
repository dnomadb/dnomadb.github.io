var tileSize,
    locationHash,
    everyOther = true;


var loadHash = window.location.hash.replace('#', '').split('/');

if (loadHash.length != 3) {
    loadHash = [37.77872, -122.26403, 18];
    history.pushState(null, null, '#' + loadHash[0] + '/' + loadHash[1] + '/' + loadHash[2])
}

var map = L.map('map_canvas', {
    center: [loadHash[0], loadHash[1]],
    zoom: loadHash[2],
    worldCopyJump: true,
    doubleClickZoom: false
});

var tiles = new L.TileLayer.Canvas({
    unloadInvisibleTiles: true,
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});


var worker = new Worker('sweep-search.js');

worker.addEventListener('message', function (response) {
    // Take the 'edge' response, set the cursor
    //cursMark.setLatLng(response.data);
}, false);

var drawStyles = {
    color: 'red'
}
var hoverStyle = {
    color: 'white'
}

var lineArr = [L.polyline([], drawStyles)],
    startPoint = L.circleMarker([], drawStyles)
        .on('mouseover', function () {
            this.setRadius(10)
                .setStyle(hoverStyle);
        })
        .on('mouseout', function () {
            this.setRadius(8)
                .setStyle(drawStyles);
        })
        .on("click", endDraw),
    currPoint = L.circleMarker([], drawStyles);

lineArr[0].addTo(map);


function drawShape(e) {
    lineArr[lineArr.length - 1].addLatLng(e.latlng);
    worker.postMessage({
        'data': {
            'lat': e.latlng.lat,
            'lng': e.latlng.lng
        },
        type: 'firstpoint'
    });
    currPoint.setStyle(hoverStyle);
    setTimeout(function () {
        currPoint.setStyle(drawStyles);
    }, 100)
}

var edgePoints = L.layerGroup([])
    .addTo(map);

worker.addEventListener('message', function (response) {
    // TODO - Edge correlation sensitive to first mouse move after click - need to work out a method to straighten.
    if (response.data.type == "movepoint") {
        lineArr[lineArr.length - 1].spliceLatLngs(-1, 1, response.data.data);
        currPoint.setLatLng(response.data.data);
    }
    else if (response.data.type == "edgepoint") {
        edgePoints.addLayer(L.circleMarker(response.data.data, { radius: 3 }));
    }
    else {
        edgePoints.clearLayers();
    }
}, false);

function updatePoint(e) {
    worker.postMessage({
        'data': {
            'lat': e.latlng.lat,
            'lng': e.latlng.lng,
            'zoom': map.getZoom()
        },
        type: 'mouseevent'
    });
}

function startDraw(e) {
    lineArr[lineArr.length - 1].addTo(map)
    drawShape(e);
    map.on("mousemove", updatePoint);
    currPoint
        .setLatLng(e.latlng)
        .setRadius(5)
        .addTo(map);
    startPoint
        .setLatLng(e.latlng)
        .setRadius(10)
        .addTo(map);
}

function endDraw() {
    lineArr[lineArr.length - 1].spliceLatLngs(-1, 1, startPoint.getLatLng());
    map.removeLayer(startPoint);
    map.removeLayer(currPoint);
    lineArr.push(L.polyline([], drawStyles));
    map.off('mousemove');
    map.once("click", startDraw);
}
map.once("click", startDraw)

map.on("click", drawShape);

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
        // Draw Image Tile
        context.drawImage(imageObj, 0, 0);

        // Get Image Data
        var imageData = context.getImageData(0, 0, tileSize, tileSize);

        worker.postMessage({
            'data': {
                'tileUID': tileUID,
                'tileSize': tileSize,
                'array': imageData.data
            },
            'type': 'tiledata'
        },
            [imageData.data.buffer]);

    }

    // Source of image tile
    imageObj.crossOrigin = 'Anonymous';
    imageObj.src = `https://b.tiles.mapbox.com/v4/mapbox.satellite/${zoom}/${tile.x}/${tile.y}.webp?access_token=pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjbGdsOHRpYWcxbWxwM3NueWYwYWYwbms0In0.zb8hlW2-BNebPuQ2hhiAuw`;

}

tiles.addTo(map);
