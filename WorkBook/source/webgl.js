
var canvas;
var gl;

var origin = mat4();

var NumVertices  = 36;

var points = [];
var colors = [];

var xRotation = 0;
var yRotation = 0;
var rotation = [ 0, 0, 0 ];

var rotationLoc;

// HW470: these variables are to allow the cubes to be scaled and translated
var scaleLoc;
var cubes = [];
var numCubes = 0;

var fovy = 60.0;
var aspect = 4/3;
var near = 2.0;
var far = 500.0;

//var near = -5;
//var far = 5;

//var left = -5.0;
//var right = 5.0;
//var ytop = 5.0;
//var bottom = -5.0;


var radius = 1;
var theta = 0;
var phi = 0;

var eye;// = vec3(0.0, 1.0, 1.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);


var incRad =  0;
var incThe =  0;
var incPhi =  0;


var program;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //Load shaders and initialize attribute buffers
    program = createProgram( gl );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	
    scaleLoc = gl.getUniformLocation(program, 'scale');
    
    for(var i=0; i<=124; i++)
        addCube(i);
    //addCube(62);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    rotationLoc = gl.getUniformLocation(program, "rotation"); 
    
	canvas.onclick = function(e){
        console.log("eye: " + eye);
        console.log("radius: " + radius);
        console.log("theta: " + theta);
        console.log("phi: " + phi);

        console.log("-----------------------------");
    };
    
    document.getElementById( "up"    ).onmousedown = () => { xRotation = -1; };
    document.getElementById( "up"    ).onmouseup   = () => { xRotation =  0; };
    document.getElementById( "down"  ).onmousedown = () => { xRotation =  1; };
    document.getElementById( "down"  ).onmouseup   = () => { xRotation =  0; };
    document.getElementById( "right" ).onmousedown = () => { yRotation =  1; };
    document.getElementById( "right" ).onmouseup   = () => { yRotation =  0; };
    document.getElementById( "left"  ).onmousedown = () => { yRotation = -1; };
    document.getElementById( "left"  ).onmouseup   = () => { yRotation =  0; };

    document.getElementById( "radius+" ).onmousedown = () => { incRad =  1; };
    document.getElementById( "radius+" ).onmouseup   = () => { incRad =  0; };
    document.getElementById( "theta+"  ).onmousedown = () => { incThe =  1; };
    document.getElementById( "theta+"  ).onmouseup   = () => { incThe =  0; };
    document.getElementById( "phi+"    ).onmousedown = () => { incPhi =  1; };
    document.getElementById( "phi+"    ).onmouseup   = () => { incPhi =  0; };
    document.getElementById( "radius-" ).onmousedown = () => { incRad = -1; };
    document.getElementById( "radius-" ).onmouseup   = () => { incRad =  0; };
    document.getElementById( "theta-"  ).onmousedown = () => { incThe = -1; };
    document.getElementById( "theta-"  ).onmouseup   = () => { incThe =  0; };
    document.getElementById( "phi-"    ).onmousedown = () => { incPhi = -1; };
    document.getElementById( "phi-"    ).onmouseup   = () => { incPhi =  0; };
        
    render();
}

function addCube(number){
    var x = (number % 5.0) * 2.0;
    var y = (Math.floor(number / 25.0)) * 2.0;
    var z = (- Math.floor((number%25) / 5.0) - 3.0) * 2.0;

    x -= 4.0;
    y -= 4.0;

    x = x*0.25;
    y = y*0.25;
    z = z*0.25 + 1;
    numCubes++;

    //console.log(number + ": " + JSON.stringify({x:x, y:y, z:z}));

    cubes.push(
        {
            translate: {x:0.0, y:0.0, z:0.0},
            origin: {x:x, y:y, z:z},
            scale: 0.35,
        }
    );
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
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
        [ 1.0, 1.0, 1.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // orange (green)
        [ 1.0, 0.5, 0.0, 1.0 ],  // blue (orange)
        [ 1.0, 1.0, 1.0, 1.0 ],  // magenta (white)
        [ 0.0, 0.0, 1.0, 1.0 ],  // white (blue)
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( vertexColors[a] );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    rotation[0] += xRotation;
    rotation[1] += yRotation;
    gl.uniform3fv(rotationLoc, rotation);

    
    radius += incRad * Math.PI / 180;
    theta += incThe * Math.PI / 180;
    phi += incPhi * Math.PI / 180;

    //radius = 3.75 + (Math.cos(theta - Math.PI) * 3/4);

    //eye = vec3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));
    eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta), radius*Math.cos(phi));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    //projectionMatrix = ortho(left, right, bottom, ytop, near, far);
			
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    
	for(var i=0; i<numCubes; i++)
	{
        renderCube(i);
	}

    requestAnimFrame( render );
}

var a = 0;

function renderCube(cubeID)
{
    var cubeOrigin = cubes[cubeID].origin;
    var cubeTranslate = cubes[cubeID].translate;
    
    var scaling = cubes[cubeID].scale;
    var scaleMatrix = new Float32Array([
        scaling, 0.0,     0.0,     cubeOrigin.x + cubeTranslate.x,
        0.0,     scaling, 0.0,     cubeOrigin.y + cubeTranslate.y,
        0.0,     0.0,     scaling, cubeOrigin.z + cubeTranslate.z,
        0.0,     0.0,     0.0,     1.0  
    ]);

    gl.uniformMatrix4fv(scaleLoc, false, scaleMatrix);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

