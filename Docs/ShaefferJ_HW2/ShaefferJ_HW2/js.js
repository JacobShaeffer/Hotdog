
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

// HW470: these variables are to allow the cubes to be scaled and translated
var scaleLoc;
var scale = 0.5;
var translate = [];
var numCubes = 0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
	// HW470: associate the locale variable scaleLoc with the shader variable scale
	scaleLoc = gl.getUniformLocation(program, 'scale');

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    //event listeners for buttons, slider, and canvas
	
	// HW470: when the canvas is clicked get the location and place a new cube centered there
	canvas.onclick = function(e){
		var rect = canvas.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;
		x = (x/512 * 2) - 1;
		y = 1 - (y/512 * 2);
		var z = (Math.random() * 2) - 1.2;
		translate.push([x, y, z]);
		numCubes++;
		
		//add new cube with above translation
	};
	
	// HW470: when the value of the slider changes, calculate the new scale of the cube
	document.getElementById("slider").onchange = function() {
		//change the scale of the cubes here
		scale = this.value/100;
	};
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
	// HW470: apply a random rotation when the approptiate button is pressed
	document.getElementById( "randomButton" ).onclick = function () {
        var choose = Math.floor(Math.random() * 3) + 1;
		if(choose == 3)
			axis = zAxis;
		else if(choose == 2)
			axis = yAxis;
		else
			axis = xAxis;
    };
        
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
	
	console.log(points);
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // white
        [ 1.0, 1.0, 1.0, 1.0 ]   // cyan
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( vertexColors[a] );
    
        // for solid colored faces use 
        //colors.push(vertexColors[a]);
        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
	
	// HW470: create the matrix for scaling and translation then apply it through uniformMatrix4fv
	for(var i=0; i<numCubes; i++)
	{
		var scaleMatrix = new Float32Array([
			scale, 0.0,   0.0,   translate[i][0],
			0.0,   scale, 0.0,   translate[i][1],
			0.0,   0.0,   scale, translate[i][2],
			0.0,   0.0,   0.0,   1.0  
		]);
		gl.uniformMatrix4fv(scaleLoc, false, scaleMatrix);

		gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	}

    requestAnimFrame( render );
}

