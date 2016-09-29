// Data Structure for Coordinates
var Point = function (x, y) {
	this.x = x;
	this.y = y;
}
// RNG
var chance;

// Map Data & Functions
function Map (dimension, roughness, seed) {
	// Map Data
	this.grid = []; // an array of points
	this.dimension = dimension + 1;
	this.roughness = roughness;
	this.smoothing = 1.2;
	
	// Seed the RNG
	chance = new Chance(seed)
	
	// Generate a 2D array	- grid[x][y]
	this.grid = new Array(this.dimension);
	for(var i = 0; i < this.dimension; i++) 
		this.grid[i] = new Array(this.dimension);
	
	// Fill the array with -1s
	for(var x = 0; x < this.dimension; x++) 
		for (var y = 0; y < this.dimension; y++)
			this.grid[x][y] = -1; //~~( Math.random() * 9 )
	
	var step = 1; 
	
	// Seed the corners
	this.set(0, 0, /*step*/ 127+getRandomArbitrary(this.roughness) ); // top left
	this.set(this.dimension-1 , 0, /*step*/ 127+getRandomArbitrary(this.roughness) ); // top right
	this.set(0, this.dimension-1, /*step*/ 127+getRandomArbitrary(this.roughness) ); // bottom left
	this.set(this.dimension-1, /*step*/ this.dimension-1, 127+getRandomArbitrary(this.roughness) ); // bottom right
	
	// Start the algorithm
	var self = this;
	var size = this.dimension-1;
	
	/*
	==================
	==== Main Algorithm ====
	==================
	*/
	divide(size);
	
	function divide(size) {
		step++;
		var x, y, half = ~~(size / 2);
		//var scale = roughness * size;
		if (half < 1) return; // stop when sub-division is no longer possible
		
		// Diamond
		for (y = half; y < self.dimension; y += size) {
			for (x = half; x < self.dimension; x += size) {
				diamond(x, y, half, getRandomArbitrary(self.roughness));
			}
		}
		
		step++;
		
		// Square
		for (y = 0; y <= self.dimension; y += half) {
			for (x = (y + half) % size; x <= self.dimension; x += size) {
				square(x, y, half, getRandomArbitrary(self.roughness));
			}
		}
		
		self.roughness = self.roughness / self.smoothing; // apply smoothing
		divide(size / 2);
	}

	// Diamond Step Function
	function diamond(x, y, size, offset) {
		// average the four corners of the square
		var ave = average([
			self.get(x - size, y - size),		// upper left
			self.get(x + size, y - size),		// upper right
			self.get(x + size, y + size), 		// lower right
			self.get(x - size, y + size)		// lower left
		]);
		// set the mid-point of the square
		self.set(x, y, /*step*/ ave + offset);
	}

	// Square Step Function
	function square(x, y, size, offset) {
		// average the four corners of the diamond
		var ave = average([
			self.get(x, y - size),		// top
			self.get(x + size, y), 	// right
			self.get(x, y + size),	// bottom
			self.get(x - size, y)		// left
		]);
		// set the mid-point of the diamond
		self.set(x, y, /*step*/ ave + offset);
	}
	
	// Averaging function for the Mid-Points
	function average(values) {
		var valid = values.filter(function(val) { return val !== -1; });
		var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
		return total / valid.length;
	}
		
	// Debug
	//print2DArray(this.grid);
}

Map.prototype.get = function (x, y) {
	if (x < 0 || x > this.dimension || y < 0 || y > this.dimension) 
		return -1
	else
		try { return this.grid[x][y]; } catch (err) {}
}

Map.prototype.set = function (x, y, z) {
	try{ 
		if (x < 0 || x > this.dimension || y < 0 || y > this.dimension) 
			return -1
		else
			if(this.grid[x][y] == -1)
				this.grid[x][y] = z;
	} catch(err) {
		//console.log(err);
	}
}


/*
===============
== Utility Functions ==
===============
*/
function print2DArray(array) {
	for(var y = 0; y < array.length; y++) {
		document.write("<p>");
		for (var x = 0; x < array[y].length; x++)
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
    return (chance.floating({min: 0, max: 1}) - 0.5) * multiplier;
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
	var seed_element = document.getElementById("seed_option");
	var seed = seed_element.value;
	console.log("Seed is " + seed);
	var dimension_element = document.getElementById("dimension_option");
	var dimension = Number(dimension_element.options[dimension_element.selectedIndex].value);
	var roughness_element = document.getElementById("roughness_option");
	var roughness = roughness_element.options[roughness_element.selectedIndex].value;
	var rendering_element = document.getElementById("render_option");
	var render = rendering_element.options[rendering_element.selectedIndex].value;
	console.log("Done.")
	
	// Generate the map data
	console.log("Generating map data...");
	var m = new Map(dimension, roughness, seed); 
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