importScripts('general-geo-utils.js');

// object  for image pixel data
var tileData = {};

self.addEventListener('message', function (e) {
    //self.postMessage(e.data);
    if (e.data.type == 'mouseevent') {
        var edgeArr = [],
            positionArr = [],
            lastPosition,
            searchDist = 300;
        currPoint = { 'lat': e.data.data.lat, 'lng': e.data.data.lng },
            noneFound = true;


        // Iterate around the point in 15 degree increments
        for (var deg = 0; deg < 360; deg += 15) {
            // 'Empty' pixel array
            var pixArr = [0, 0, 0];
            // TODO: Allow sampling distance, and search distance to be set dynamically
            for (var dist = 0; dist < searchDist; dist += 5) {
                // Variables needed within this loop
                var tempPos = offsetPoint(currPoint, deg, dist),
                    tileInfo = latLng2tile(tempPos.lat, tempPos.lng, e.data.data.zoom);
                pixVal = tileData[tileInfo.tileCall][tileInfo.arrInd];
                // Reset the 'kernel'
                pixArr.pop();
                pixArr.splice(0, 0, pixVal);

                if (dist > 5) {
                    // Compute absolute simple 1d edge value [-1,0,1]
                    var edgeVal = Math.abs(pixArr[2] * -1 + pixArr[0] * 1);
                    // TODO: Design more adaptive thresholding (dynamic distance / edge value)
                    if (edgeVal > 200) {
                        noneFound = false;
                        // Simple weighting by inverse distance from mouse
                        edgeArr.push((searchDist - dist) * edgeVal);
                        positionArr.push(lastPosition);
                    }
                }

                lastPosition = tempPos;
            }
        }

        //Get the maximum value within this array
        var maxArrayIndex = edgeArr.indexOf(Math.max.apply(null, edgeArr));

        // If an edge above the set threshold was found, return its postion
        if (maxArrayIndex != -1 && noneFound !== true) {
            self.postMessage(positionArr[maxArrayIndex]);
        }
        else {
            //self.postMessage(currPoint)
        }
    }

    // If tile data was sent, add to data object
    else if (e.data.type == 'tiledata') {
        tileData[e.data.data.tileUID] = e.data.data.array;
    }

    // If a tile unload event was sent, delete the corresponding data
    else if (e.data.type == 'tileunload') {
        delete tileData[e.data.data];
    }

}, false);