var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var near = 0.5;
var far = 20.0;
var  fovy = 135.0;
var  aspect = 1.0;

var eye = vec3(5.0, 2.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var legAngle0 = 0.0;
var legAngle1 = 180.0;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

var theta = [0, 180, 0, 0, 0, 0, 0, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
	
    projectionMatrix = perspective(fovy, aspect, near, far);
    modelViewMatrix = lookAt(eye, at , up);

        
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    
    cube();
        
    vBuffer = gl.createBuffer();
        
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    for(i=0; i<numNodes; i++) initNodes(i);
    
    render();
}

var render = function() {
	//bodyAngle += 1;
	theta[bodyId] = bodyAngle;
	initNodes(bodyId);
	
	legAngle0 -= 2;
	legAngle1 -= 2;
	
	
	theta[leftFrontUpperId] = legAngle0;
	initNodes(leftFrontUpperId);
	theta[leftFrontLowerId] = legAngle0;
	initNodes(leftFrontLowerId);
	theta[rightBackUpperId] = legAngle0;
	initNodes(rightBackUpperId);
	theta[rightBackLowerId] = legAngle0;
	initNodes(rightBackLowerId);
	
	theta[leftBackUpperId] = legAngle1;
	initNodes(leftBackUpperId);
	theta[leftBackLowerId] = legAngle1;
	initNodes(leftBackLowerId);
	theta[rightFrontUpperId] = legAngle1;
	initNodes(rightFrontUpperId);
	theta[rightFrontLowerId] = legAngle1;
	initNodes(rightFrontLowerId);
	
	gl.clear( gl.COLOR_BUFFER_BIT );
	traverse(bodyId);
	requestAnimFrame(render);
}
