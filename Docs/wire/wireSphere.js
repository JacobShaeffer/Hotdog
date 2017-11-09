"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 3;

var NumVertices  = 36;

var index = 0;

var pointsArray = [];

var points = [];
var colors = [];

var scaleLoc;
var numCubes = 0;
var cubes = [];

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);
     index += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function addCube(number){
    var x = (number % 5.0) * 2.0;
    var z = (- Math.floor(number / 5.0) - 3.0) * 2.0;
    var y = -4.0 * 0.25;
    x -= 4.0;
    x = x*0.25;
    z = z*0.25;
    numCubes++;

    cubes.push(
        {
            translate: {x:0.0, y:0.0, z:0.0},
            origin: {x:x, y:y, z:z},
            scale: 0.25,
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
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
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

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    
    scaleLoc = gl.getUniformLocation(program, 'scale');

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    colorCube();

    for(var i=0; i<25; i++)
        addCube(i);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("Button0").onmousedown = function(){theta += dr;};
    document.getElementById("Button1").onmousedown = function(){theta -= dr;};
    document.getElementById("Button2").onmousedown = function(){phi += dr;};
    document.getElementById("Button3").onmousedown = function(){phi -= dr;};

    document.getElementById("Button0").onmouseup = function(){theta += dr;};
    document.getElementById("Button1").onmouseup = function(){theta -= dr;};
    document.getElementById("Button2").onmouseup = function(){phi += dr;};
    document.getElementById("Button3").onmouseup = function(){phi -= dr;};

    document.getElementById("Button4").onclick = function(){
        numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        init();
    };
    document.getElementById("Button5").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        init();
    };
    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );


    //for( var i=0; i<index; i+=3)
    //   gl.drawArrays( gl.LINE_LOOP, i, 3 );

    for(var i=0; i<numCubes; i++)
	{
        renderCube(i);
	}

    window.requestAnimFrame(render);

}

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

    //scaleMatrix = mult(scaleMatrix, transformMatrix);

    gl.uniformMatrix4fv(scaleLoc, false, scaleMatrix);
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
}