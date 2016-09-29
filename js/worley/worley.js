// Data Structure for Coordinates
var Point = function (x, y) {
	this.x = x;
	this.y = y;
}

// Map Data & Functions
var Map = function (dimension, n, fp) {
	// Map Data
	this.grid = []; // an array of points
	this.dimension = dimension;
	
	// Worley Noise Data
	this.n = n;
	this.nfeaturePoints = fp;
	this.featurePoints = [];
	
	// Generate a 2D array	- grid[x][y]
	this.grid = new Array(this.dimension);
	for(var i = 0; i < this.dimension; i++) 
		this.grid[i] = new Array(this.dimension);
	
	// Start the noise generation
	this.worleyNoise();
}
	
/*
================
=== Main Algorithm ===
================
*/
Map.prototype.worleyNoise = function () {
	// Generate the feature points
	for(var i = 0; i < this.nfeaturePoints; i++)
		this.featurePoints[i] = new Point( this.getRandomCoordinate(), this.getRandomCoordinate() );
		
	// For each pixel	
	for(var x = 0; x < this.dimension; x++) {
		for (var y = 0; y < this.dimension; y++){
			var index = 0;
			var currentPixel = new Point(x,y);
			var distanceValues = [];
			
			for(var i = 0; i < this.nfeaturePoints; i++) { // for each feature point
				distanceValues.push( distance(currentPixel, this.featurePoints[i]) ); //store the distance value
				distanceValues.sort(function(a, b){return a-b}); // sort the distance values
			}
			
			// assign the the distance value for the nth closest feature point to the pixel
			this.grid[x][y] = ( (distanceValues[this.n-1] / this.dimension) * 255 ) * 2;
		}
	}
	
	// Euclidean Distance Function
	function distance(p, q) {
		return Math.sqrt( Math.pow( (p.x - q.x) , 2) + Math.pow( (p.y - q.y) , 2) );
	} 
}

Map.prototype.getRandomCoordinate = function() {
	return ~~(Math.random() * this.dimension)
}


/*
===============
== Utility Functions ==
===============
*/
function print2DArray(array) {
	for(var x = 0; x < array.length; x++) {
		document.write("<p>");
		for (var y = 0; y < array[x].length; y++)
			document.write(array[x][y] + " - ");
		document.write("</p>");
	}
}
function get2DArraySize(array) {
	var arraySize = 0;
	for(var x = 0; x < array.length; x++) 
		arraySize += array[x].length;
	return arraySize;
}
function getRandomArbitrary(multiplier) {
    return (Math.random() - 0.5) * multiplier;
}
function constrain(num) {
	if (num > 255) num = 255;
	if (num < 0) num = 0;
	return num;
}


/*
==============
== Main Program ==
==============
*/
function generateHeightmap() {
	// Sort the options
	console.log("Retrieving options...");
	var dimension_element = document.getElementById("dimension_option");
	var dimension = Number(dimension_element.options[dimension_element.selectedIndex].value);
	var n_element = document.getElementById("nth_option");
	var n = n_element.options[n_element.selectedIndex].value;
	var fp_element = document.getElementById("feature_points_option");
	var fp = fp_element.options[fp_element.selectedIndex].value;
	var rendering_element = document.getElementById("render_option");
	var render = rendering_element.options[rendering_element.selectedIndex].value;
	console.log("Done.")
	
	// Generate the map data
	console.log("Generating map data...");
	var m = new Map(dimension, n, fp); 
	console.log("A " + m.grid.length + "x" + m.grid[0].length + " grid has generated with " + get2DArraySize(m.grid) + " points.");
	
	// Set up the canvas
	console.log("Getting canvas context and resizing...")
	c = document.getElementById("web_canvas");
	c.height = dimension;
	c.width = dimension;
	ctx = c.getContext("2d");
	console.log("The canvas context has been successfully set up.")
	
	// Render the map data on the canvas
	console.log("Painting the canvas...")
	if(render == "Grayscale") {
		for(var x = 0; x < m.grid.length; x++) {
			for (var y = 0; y < m.grid[x].length; y++) {
				ctx.fillStyle = "rgb("+Math.round(m.grid[x][y])+","+Math.round(m.grid[x][y])+", "+Math.round(m.grid[x][y])+")";
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}
	if(render == "RedBlue") {
		for(var x = 0; x < m.grid.length; x++) {
			for (var y = 0; y < m.grid[x].length; y++) {
				ctx.fillStyle = "rgb("+Math.round(m.grid[x][y])+","+0+", "+(255-Math.round(m.grid[x][y]))+")";
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}
	if(render == "Brown") {
		for(var x = 0; x < m.grid.length; x++) {
			for (var y = 0; y < m.grid[x].length; y++) {
				ctx.fillStyle = "rgb("+Math.round(m.grid[x][y])+","+Math.round(m.grid[x][y])/2+", "+Math.round(m.grid[x][y])/3+")";
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}
	console.log("Done.")
}