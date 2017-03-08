//Manuel Vargas
//2/21/17
//This program displays a rotating pendulum with a bob around a anchor.
//both the bob and wire are moving about the origin
//anchor is static at the origin
//each of these three objects each have a different color

//I've added functions to reset or increase the speed of the  bob and wire
//Using RotatingTranslatedTriangle.js (c) 2012 matsuda as a template

"use strict";

//GLOBAL VARIABLES
var ANGLE_STEP = 45.0; //Rotation angle (degrees/second)=angular velocity
var r = 0.1;	//point size of the anchor the radius of the bob
var l = 0.8;	//length of the wire

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +	//uniform 4x4 matrix
  'void main() {\n' +
  'gl_Position = u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
	'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +	
	'void main() {\n' +
	'gl_FragColor = u_FragColor;\n' +	//multi color:so objects can have different color
	'}\n';

// Last time that this function was called
var g_last = Date.now();

function animate(angle) {
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}

/**************/
/****Buttons***/
/**************/
function up() {	//increment by 10
	ANGLE_STEP += 10; 
	console.log("ns: "+ANGLE_STEP);
}
function down() {	//decrement by 10
	ANGLE_STEP -= 10;
	console.log("ns: "+ANGLE_STEP);
}
function reset() { //reset to initial speed
	ANGLE_STEP = 45;
	console.log("ns: "+ANGLE_STEP);
}
function faster() {	//increment by 1000
	ANGLE_STEP += 1000;
	console.log("ns: "+ANGLE_STEP);
}
function stop() {	//stop animation
	ANGLE_STEP = 0;
	console.log("ns: "+ANGLE_STEP);
}

/**************/
/**Initialize**/
/**************/
function initVertexBuffers(gl) {					
	// Create a buffer object
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Assign the buffer object to a_Position variable
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
	return -1;
	}
	
	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);	//only need to enable once
	return vertexBuffer;
}

/**************/
/*****Main*****/
/**************/
function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}
	// Write the positions of vertices to a vertex shader
	var n = initVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the positions of the vertices');
		return;
	}
	// Get the storage location of u_FragColor
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

	// Specify the color for clearing <canvas>
	gl.clearColor(0.2, 0.55, 0.7, 1);	//Canvas Color
	
	// Get storage location of u_ModelMatrix
	//this will be the animated matrix
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix) { 
	console.log('Failed to get the storage location of u_ModelMatrix');
	return;
	}
	
	// Get storage location of u_ModelMatrix_static
	//this will be the static matrix
	var u_ModelMatrix_static = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix_static) { 
	console.log('Failed to get the storage location of u_ModelMatrix');
	return;
	}
	
	// Current rotation angle
	//start at 0 degrees
	var currentAngle = 0;	//Starting Angle
	
	// Model matrix
	var modelMatrix = new Matrix4();	//create animatrix
	var modelMatrix_static = new Matrix4();	//create static matrix
	
	//color vector
	var color = [
		[1.0, 0.1, 0.1],		//red wire
        [0.0, 1.0, 0.3],		//green anchor
        [0.2, 0.3, 1.0]			//blue bob
	];	

	//wire vertices
	var wire_vertices = [					
		0,0,
		l,0		//length of 0.8
	];
	
	//bob vertices through a TRIANGLE_FAN
	var bob_vertices = [
		l, 				0.0, 	0.0,	//1
		(l+(.1/2)),		0.1,	0.0,  	//2
		(l-(.1/2)),		0.1, 	0.0,	//3
		(l-.1),			0.0,	0.0,	//4
		(l-(.1/2)),		-0.1,	 0.0,	//5
		(l+(.1/2)),		-0.1,	0.0,  	//6
		(l+.1),			0.0,	0.0,	//7
		(l+(.1/2)),		0.1,	0.0,  	//8
	];
	
	//anchor vertices through a TRIANGLE_STRIP
	var anchor_vertices = [
		0.05, 	0.05, 	0.0,
		-0.05,	0.05,	0.0,  	
		0.05,	-0.05, 	0.0,
		-0.05,	-0.05,	0.0
	];
	
	// Assign the buffer object to a_Position variable
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	
	//accept as input vertices with 2 points (x,y) *cough cough* wire
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);	

	// Start drawing everything
	//both draw functions are inside here
	//loops forever
	var tick = function() {
		//Update the rotation angle
		currentAngle = animate(currentAngle);  
		
		//draw wire and bob first that will rotate
		draw_rotate(gl,
			currentAngle, 
			modelMatrix, 
			u_ModelMatrix, 
			u_FragColor,
			color,
			wire_vertices,
			bob_vertices);
		
		// Draw the the anchor(square) which will not move
		draw_static(gl,
			currentAngle, 
			modelMatrix_static, 
			u_ModelMatrix_static, 
			u_FragColor,color,
			anchor_vertices); 
		
		//Request that the browser call tick()
		requestAnimationFrame(tick, canvas); 		
	};
	tick();
}

/************************/
/*****Draw Functions*****/
/************************/
//Create a different matrix for the square so that it doesn't rotate
//draw the static items first
//the only static item is the green square
function draw_static(gl, currentAngle, modelMatrix, u_ModelMatrix, 
	u_FragColor, color, anchor_vertices){

	//send WebGL the values from our JavaScript-style matrices.
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	
	//do not paint new background
	//gl.clear(gl.COLOR_BUFFER_BIT); 
	
	/**************/
	/*ANCHOR SETUP*/
	/**************/
	// Pass the color of a point to u_FragColor variable
	//change color to green
	gl.uniform4f(u_FragColor,
		color[1][0],
		color[1][1],
		color[1][2], 1.0);
	
	// Write data into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array (anchor_vertices), gl.STATIC_DRAW);
	//draw square with triangle strip
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);	//drawing anchor
}

//draws the moving parts
function draw_rotate(gl, currentAngle, modelMatrix, u_ModelMatrix, 
	u_FragColor, color,	wire_vertices, bob_vertices) {
	
	// Set the rotation matrix
	//both bob and wire should rotate like this
	modelMatrix.setRotate(currentAngle, 0, 0, 1);	
	// Pass the rotation matrix to the vertex shader
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	/************/
	/*WIRE SETUP*/
	/************/
	//change color to red for the wire
	gl.uniform4f(u_FragColor,
		color[0][0], 
		color[0][1], 
		color[0][2], 1.0);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array (wire_vertices), gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		if(a_Position < 0) {
			console.log('Failed to get the storage location of a_Position');
			return -1;}
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);	
	//draw wire
	gl.drawArrays(gl.LINES, 0, 2);
	
	/***********/
	/*BOB SETUP*/
	/***********/
	//BOB COLOR = Blue
	gl.uniform4f(u_FragColor, 
		color[2][0], 
		color[2][1], 
		color[2][2], 1.0);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array (bob_vertices), gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;}
	//change vertices to include a 3rd axis (x,y,z)
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	
	//draw bob
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);	//8 vertices
}