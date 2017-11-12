var canvas;
var gl;
var NumVertices  = 36;
var points = [];
var colors = [];
var program;

var modelViewMatrixLoc, modelViewMatrix;
var projectionMatrixLoc, projectionMatrix;
var scale, scaleMatrix, scaleMatrixLoc;
var translateLoc;

var near = -1.0; 
var far = 1.0;
var left = -1.0;
var right = 1.0;
var bottom = -1.0
var top = 1.0;

var eye = vec3(0.0, 1.0, 1.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

window.onload = function init(){
    canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL( canvas );
    if(!gl){
        alert("WebGL is unavailable.");
        return;
    }

    scale = {x:1.0, y:1.0, z: 1.0};
    scaleMatrix = new Float32Array([
        scale.x, 0.0,     0.0,     1.0,
        0.0,     scale.y, 0.0,     1.0,
        0.0,     0.0,     scale.z, 1.0,
        0.0,     0.0,     0.0,     1.0  
    ]);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );

    program = createProgram( gl );
    gl.useProgram( program );

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW );

    var vertexColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vertexColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexColor );

    var vertexBuffer = gl.createBuffer()
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.STATIC_DRAW );

    var vertexPosition = gl.getAttribLocation( program, 'vPosition' );
    gl.vertexAttribPointer( vertexPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    scaleMatrixLoc = gl.getUniformLocation( program, 'scale' );
    translateLoc = gl.getUniformLocation( program, 'translate' );

    gl.uniformMatrix4fv(scaleMatrixLoc, false, scaleMatrix);

    createCube();

    render();

}

function addCube(){

}

function createCube(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) {
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
        [ 1.0, 0.0, 0.0, 1.0 ],  // red    //front
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow //right
        [ 0.0, 1.0, 0.0, 1.0 ],  // green  //bottom
        [ 1.0, 0.5, 0.0, 1.0 ],  // orange //back
        [ 1.0, 1.0, 1.0, 1.0 ],  // white  //left
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue   //back
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( vertexColors[a] );
    }
}

function render(){
    gl.clear( gl.COLOR_BIT_BUFFER | gl.DEPTH_BUFFER_BIT );
    gl.enable( gl.CULL_FACE );
    gl.enable( gl.DEPTH_TEST );

    var translate = vec3( 1.0, 1.0, 1.0 );
    gl.uniform3fv( translateLoc, translate );

    modelViewMatrix = lookAt( eye, at, up );
    projectionMatrix = ortho( left, right, bottom, top, near, far );

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten( modelViewMatrix ) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten( projectionMatrix ) );

    gl.drawArrays( gl.TRIANGLES, 0, 36 );

    requestAnimationFrame( render );

}