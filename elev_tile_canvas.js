var tileSize;

function distance(p1,p2){
	// Measure distance between two points / R = Radius of Earth in desired units
	var R = 3963,
		dLat = (Math.PI/180.0)*((p2.lat-p1.lat)),
		dLon = (Math.PI/180.0)*((p2.lng-p1.lng)),
		lat1 = (Math.PI/180.0)*p1.lat,
		lat2 = (Math.PI/180.0)*p2.lat,
		a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2),
		c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),
		d = R * c;
	return d;
}

function init(){
	// Poly / Rectangle Holder + Tile Data Holder
	var rectArr= [],
		tileDataArr = {"data":{},"display":{}};
	
	var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/dnomadb.hgp0dahj/{z}/{x}/{y}.png', {
		attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
	});
	
	var mbTiles = new L.tileLayer("rgbelev/{z}/{x}/{y}.png", {
		tms: false,
		opacity: 1
	});
	
	var layers = [mapboxTiles,mbTiles];
	
	var map = L.map('map_canvas',{
		center: [37.78, -122.37],
		zoom: 6,
		layers:layers[0],
		maxZoom: 7,
		worldCopyJump: true
		});
		
	var tiles = new L.TileLayer.Canvas({unloadInvisibleTiles:true});
	
	cLayer = 1;
	
	// Delete tile data / canvas on tile unload
	tiles.on('tileunload', function(e){
		delete tileDataArr.display[e.tile._tilePoint.id];
		delete tileDataArr.data[e.tile._tilePoint.id];
	});
	
	$("#clearbutton").on("click",function(){
		for (i in rectArr){
			map.removeLayer(rectArr[i].rect);
		}
		rectArr.length = 0;
	});
	
	// Toggle between layers
	$("#elevtoggle").on("click", function(){
		map.addLayer(layers[cLayer]);
		if (cLayer == 1){cLayer = 0;}
		else{cLayer = 1};
		map.removeLayer(layers[cLayer]);
	});
	
	// Begin drawing initial rectangle
	map.once("click",drawShape);
	
	function updateRect(e){
		// Update initial rectangle on mouse move
		rectArr[rectArr.length-1].bounds[1] = e.latlng;
		rectArr[rectArr.length-1].rect.setBounds(rectArr[rectArr.length-1].bounds);
	}
	
	function endDraw(e){
		// Turn off earlier listeners
		map.off("mousemove",updateRect);
		
		// Re-add initial listener
		map.once("click",drawShape);
		
		// Calculate initial rect corners / dimensions - "distances" are reduced based on zoom level
		var lRight = rectArr[rectArr.length-1].bounds[0],
			uLeft = rectArr[rectArr.length-1].bounds[1];
			uRight = {"lat": uLeft.lat,"lng":lRight.lng},
			vDist = Math.round(distance(uRight,lRight)*(map.getZoom()+1)/15),
			hDist = Math.round(distance(uRight,uLeft)*(map.getZoom()+1)/15);
			
		// Switch bounds if neccesary to insure correct drawing order
		if (lRight.lat>uRight.lat){
			var tUp = uRight;
			uRight = lRight;
			lRight = tUp;
		}
		
		// Iterate through "rows" and "columns" of desired drawing intervals
		for (var r = 0;r<vDist+1;r++){
			var tLocs = [],
				vPos = uRight.lat+(((lRight.lat-uRight.lat)/vDist)*r);
			for (var c = 0;c<hDist+1;c++){
			
				var hPos = uRight.lng+(((uLeft.lng-uRight.lng)/hDist)*c);
				
				// Get elevation at the above point
				var a = latLng2tile(vPos,hPos, map.getZoom());
				if (isNaN(tileDataArr.data[a.tileCall][a.arrInd])!=true){
				//Offset the vertex based on elev
					var dVal = tileDataArr.data[a.tileCall][a.arrInd];
					tLocs.push([vPos+(dVal/5000),hPos]);
				}
				
			}
			
			//Add bottom vertices to polygons
			tLocs.push([lRight.lat,uLeft.lng])
			tLocs.push(lRight);
			
			//Make a rectangle out of it
			var regStyle = {color: "#ff7800", weight: 0.5, fillOpacity:1,fillColor:"black"},
				hovStyle = {color: "#ffffff", weight: 1, fillOpacity:1,fillColor:"black"}
				
			var tRect = new L.polygon(tLocs, regStyle)
				.addTo(map)
				.on("mouseover", function(){this.setStyle(hovStyle)})
				.on("mouseout", function(){this.setStyle(regStyle)});
			rectArr.push({"rect":tRect});
		}
		
	}
	
	function drawShape(e){
		//Begin drawing initial rectangle
		var tBounds = [e.latlng,e.latlng],
			tRect = new L.rectangle(tBounds, {color: "#ff7800", weight: 1}).addTo(map);
		rectArr.push({"rect":tRect,"bounds":tBounds});
		map.on("mousemove",updateRect);
		map.once("click", endDraw);
	}
	
	tiles.drawTile = function (canvas, tile, zoom) {
		tileSize = this.options.tileSize;
		
		var context = canvas.getContext('2d'),
			dataCanvas = canvas.getContext('2d'),
			displayData = context.createImageData(tileSize,tileSize),
			imageObj = new Image(),
			tileUID = ""+zoom+"/"+tile.x+"/"+tile.y;
			
		// To access / delete tiles later
		tile.id = tileUID;
		
		imageObj.onload = function() {
			// Draw Image tile
			context.drawImage(imageObj, 0, 0);
			
			var imageData = context.getImageData(0, 0, tileSize, tileSize),
				dataArray = new Float32Array(65536);
			pos = 0;
			for (y = 0; y < tileSize; y++) {
				for (x = 0; x < tileSize; x++) {
					// Calculated value - in Meters
					var tDataVal = (8242*((imageData.data[pos]*(255*255)+imageData.data[pos+1]*255+imageData.data[pos+2])/16777216))-410;
					dataArray[pos/4] = (tDataVal);
					displayData.data[pos++] = Math.max(0,Math.min(255, 0));
					displayData.data[pos++] = Math.max(0,Math.min(255,0))
					displayData.data[pos++] = Math.max(0,Math.min(255, 0));
					displayData.data[pos++] = Math.max(0,Math.min(255, 0));
					}
			}
			
			// Add data array to canvas tile object
			tileDataArr.data[tileUID] = dataArray;
        	dataCanvas.drawImage(imageObj, 0, 0);
	
			tileDataArr.display[tileUID] = context;
			context.putImageData(displayData,0,0);

		}
		// Source of image tile
		imageObj.src = "rgbelev/"+zoom+"/"+tile.x+"/"+tile.y+".png"
	}
	
	tiles.addTo(map);
	
}