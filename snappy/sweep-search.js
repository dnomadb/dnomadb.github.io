importScripts('general-geo-utils.js');

// Variables to be defined later, but needed in this context
var firstPoint,
    currBearing,
    currZoom,
    currDist,
    newBearing,
    lastMoveDist,
    kernelSamples,
    lastPoint;

// Tile Data Holder
var tileData = {};

//Interval (ft) upon which to sample
var sampInter = 4;

// Maximum Search Factor - search distance = sampInter*searchFactor;
var searchFactor = 24;
// Minimum mouse distane to re-search
var mouseMoveThreshold = 30;
// Minimum segment length before re-searching
var minimumEdgeLength = 70;
// Density on the line to sample
var searchDensity = 10;

//Listen for events
self.addEventListener('message', function(e) {

    // obect to hold various methods based on message to worker
    var edgeFind = {
        // If event is a mouse event
        mouseevent: function (inPoint) {
            var currPoint = {
                lat: inPoint.lat,
                lng: inPoint.lng
            }

            currZoom = inPoint.zoom;
            currDist = distance(currPoint,firstPoint);
            kernelSamples = Math.round(currDist/searchDensity);

            if (currDist<minimumEdgeLength) {
                // send message to set point at mouse move position
                self.postMessage({
                    type:'movepoint',
                    data:currPoint
                });
                lastMoveDist = mouseMoveThreshold+1;
                lastPoint = currPoint;
            }

            else if (lastMoveDist>mouseMoveThreshold) {
                //send message to clear edge points
                self.postMessage({
                    type:'clearedgepoints'
                });

                currBearing = bearingDegrees(currPoint,firstPoint);
                distInterval = currDist/(kernelSamples+1);
                var lastSamplePoint = firstPoint,
                    accBearing = 0,
                    accX = 0,
                    accY = 0;

                for (var k = 1;k<kernelSamples+1;k++) {
                    var tempSamplePt = offsetPoint(firstPoint,currBearing-180,k*distInterval),
                        alignKern = [0,0,0],
                        edgeAlignArr = [];
                        alignPositions = [];

                    for (var i = -1*searchFactor*sampInter;i<sampInter*searchFactor+1;i+=sampInter) {

                        var tempPoint = offsetPoint(tempSamplePt,currBearing+90,i),
                            tileInfo = latLng2tile(tempPoint.lat,tempPoint.lng,currZoom);
                        alignKern.pop();
                        alignKern.splice(0,0,tileData[tileInfo.tileCall][tileInfo.arrInd]);

                        if (i>=-1*searchFactor*sampInter+2*sampInter) {
                            edgeAlignArr.push(((searchFactor*sampInter)-Math.abs(i))*Math.abs(-1*alignKern[0]+1*alignKern[2]));
                            alignPositions.push(tempPoint);
                        }

                    }
                    var maxArrayIndex = edgeAlignArr.indexOf(Math.max.apply(null, edgeAlignArr));


                    if (maxArrayIndex!=-1) {
                        var currEdgeBearing = bearingRadians(lastSamplePoint,alignPositions[maxArrayIndex]);
                        accX+=Math.sin(currEdgeBearing);
                        accY+=Math.cos(currEdgeBearing);

                        lastSamplePoint = alignPositions[maxArrayIndex];
                        // Send message to make an "edge point"
                        self.postMessage({
                            type: 'edgepoint',
                            data: lastSamplePoint
                        });
                    }
                }

                newBearing = 180+(Math.atan2(accX,accY)*180/Math.PI);
                lastPoint = offsetPoint(firstPoint,newBearing,-1*currDist);
                lastMoveDist = 0;

            }

            else {
                newPoint = offsetPoint(firstPoint,newBearing,-1*currDist);
                // Corrected point at mean angle, and current distance
                self.postMessage({
                    type: 'movepoint',
                    data: newPoint
                });
                lastMoveDist = distance(currPoint, lastPoint);         
            }
        },

        // If it is the first click on a segment
        firstpoint: function (inPoint) {
            firstPoint = {
                lat: inPoint.lat,
                lng: inPoint.lng
            }
        },

        // If tile data was sent, add to data object
        tiledata: function (inTile) {
            var dataArray = new Uint16Array(65536);
            for (var i=0;i<inTile.array.length/4;i++) {
                // Only use R and G for speed
                var tDataVal = (inTile.array[i*4]+inTile.array[i*4+1]);
                dataArray[i] = (tDataVal);
            }
            delete inTile.array;
            tileData[inTile.tileUID] = dataArray;
        },

        // If a tile unload event was sent, delete the corresponding data
        tileunload: function (tileUnloadID) {
            delete tileData[tileUnloadID];
        }
    }
    // Call function based on message, send data.
    edgeFind[e.data.type](e.data.data);


}, false);