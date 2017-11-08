

var canvas;
var gl;

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var s1 = vec4(-0.5, -0.5, -0.5, 1);
var s2 = vec4(-0.5, -0.5, 0.5, 1);
var s3 = vec4(-0.5, 0.5, -0.5, 1);
var s4 = vec4(-0.5, 0.5, 0.5, 1);
var s5 = vec4(0.5, -0.5, -0.5, 1);
var s6 = vec4(0.5, -0.5, 0.5, 1);
var s7 = vec4(0.5, 0.5, -0.5, 1);
var s8 = vec4(0.5, 0.5, 0.5, 1);

var ua = vec4(0.0, 0.0, -1.0,1);
var ub = vec4(0.0, 0.942809, 0.333333, 1);
var uc = vec4(-0.816497, -0.471405, 0.333333, 1);
var ud = vec4(0.816497, -0.471405, 0.333333,1);

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightColors = {};
lightColors['white'] = {};
lightColors['white']['ambient'] = vec4(0.2, 0.2, 0.2, 1.0 );
lightColors['white']['diffuse'] = vec4( 1.0, 1.0, 1.0, 1.0 );
lightColors['white']['specular'] = vec4( 1.0, 1.0, 1.0, 1.0 );
lightColors['purple'] = {};
lightColors['purple']['ambient'] = vec4(0.2, 0.0, 0.2, 1.0 );
lightColors['purple']['diffuse'] = vec4( 1.0, 0.0, 1.0, 1.0 );
lightColors['purple']['specular'] = vec4( 1.0, 0.0, 1.0, 1.0 );

var lightAmbient = lightColors['white']['ambient'];
var lightDiffuse = lightColors['white']['diffuse'];
var lightSpecular = lightColors['white']['specular'];
var isLightWhite = true;
var isLightAnimating = false;

//CSE470 Property settings
var currentProperty = {};
currentProperty['setOne'] = {};
currentProperty['setOne']['obj1'] = {};//gold
currentProperty['setOne']['obj1']['ambient'] = vec4( 0.24725, 0.1995, 0.0745, 1.0 );
currentProperty['setOne']['obj1']['diffuse'] = vec4( 0.75164, 0.60648, 0.22648, 1.0 );
currentProperty['setOne']['obj1']['specular'] = vec4( 0.628281, 0.555802, 0.366065, 1.0 );
currentProperty['setOne']['obj1']['shininess'] = 40.0;
currentProperty['setOne']['obj2'] = {};//red plastic
currentProperty['setOne']['obj2']['ambient'] = vec4( 0.0, 0.0, 0.0, 1.0 );
currentProperty['setOne']['obj2']['diffuse'] = vec4( 0.5, 0.0, 0.0, 1.0 );
currentProperty['setOne']['obj2']['specular'] = vec4( 0.7, 0.6, 0.6, 1.0 );
currentProperty['setOne']['obj2']['shininess'] = 25.0;
currentProperty['setTwo'] = {};
currentProperty['setTwo']['obj1'] = {};//white plastic
currentProperty['setTwo']['obj1']['ambient'] = vec4( 0.0, 0.0, 0.0, 1.0 );
currentProperty['setTwo']['obj1']['diffuse'] = vec4( 0.55, 0.55, 0.55, 1.0 );
currentProperty['setTwo']['obj1']['specular'] = vec4( 0.7, 0.7, 0.7, 1.0 );
currentProperty['setTwo']['obj1']['shininess'] = 25.0;
currentProperty['setTwo']['obj2'] = {};//green rubber
currentProperty['setTwo']['obj2']['ambient'] = vec4( 0.0, 0.0, 0.0, 1.0 );
currentProperty['setTwo']['obj2']['diffuse'] = vec4( 0.1, 0.35, 0.1, 1.0 );
currentProperty['setTwo']['obj2']['specular'] = vec4( 0.45, 0.55, 0.45, 1.0 );
currentProperty['setTwo']['obj2']['shininess'] = 25.0;
currentProperty['setThree'] = {};
currentProperty['setThree']['obj1'] = {};//silver
currentProperty['setThree']['obj1']['ambient'] = vec4( 0.19225, 0.19225, 0.19225, 1.0 );
currentProperty['setThree']['obj1']['diffuse'] = vec4( 0.50754, 0.50754, 0.50754, 1.0 );
currentProperty['setThree']['obj1']['specular'] = vec4( 0.508273, 0.508273, 0.508273, 1.0 );
currentProperty['setThree']['obj1']['shininess'] = 40.0;
currentProperty['setThree']['obj2'] = {};//jade
currentProperty['setThree']['obj2']['ambient'] = vec4( 0.135, 0.2225, 0.1575, 1.0 );
currentProperty['setThree']['obj2']['diffuse'] = vec4( 0.54, 0.89, 0.63, 1.0 );
currentProperty['setThree']['obj2']['specular'] = vec4( 0.316228, 0.316228, 0.316228, 1.0 );
currentProperty['setThree']['obj2']['shininess'] = 10.0;
var currentPropertyValue = 1;

//CSE470 objects to hold information for each object
var cylinder = {
	pointsArray: [],
	normalsArray: [],
	length: 0,
	materialAmbient: currentProperty['setOne']['obj1']['ambient'],
	materialDiffuse: currentProperty['setOne']['obj1']['diffuse'],
	materialSpecular: currentProperty['setOne']['obj1']['specular'],
	materialShininess: currentProperty['setOne']['obj1']['shininess'],
	translation: [-0.33,0,0]
};
var custom = {
	pointsArray: [],
	normalsArray: [],
	length: 0,
	materialAmbient: currentProperty['setOne']['obj2']['ambient'],
	materialDiffuse: currentProperty['setOne']['obj2']['diffuse'],
	materialSpecular: currentProperty['setOne']['obj2']['specular'],
	materialShininess: currentProperty['setOne']['obj2']['shininess'],
	translation: [0.33,0,0]
};
objects = [];
objects.push(cylinder);
objects.push(custom);

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//CSE470 Eye variables
var eye = vec3(0.0, -1.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 0.0, 1.0);

//CSE470 Rotation variables
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [ 0, 0, 0 ];
var thetaLoc;

var program;


function triangle(a, b, c) {
	var t1 = subtract(b, a);
	var t2 = subtract(c, a);
	var normal = normalize(cross(t1, t2));
	normal = vec4(normal);
	 
	cylinder.normalsArray.push(normal);
	cylinder.normalsArray.push(normal);
	cylinder.normalsArray.push(normal);

	cylinder.pointsArray.push(a);
	cylinder.pointsArray.push(b);      
	cylinder.pointsArray.push(c);

	cylinder.length += 3;
}
function tetrahedron(a, b, c, d) {
    triangle(a, b, c);
    triangle(d, c, b);
    triangle(a, d, b);
    triangle(a, c, d);
}
function triangle2(a, b, c) {
	var t1 = subtract(b, a);
	var t2 = subtract(c, a);
	var normal = normalize(cross(t1, t2));
	normal = vec4(normal);
	 
	custom.normalsArray.push(normal);
	custom.normalsArray.push(normal);
	custom.normalsArray.push(normal);

	custom.pointsArray.push(a);
	custom.pointsArray.push(b);      
	custom.pointsArray.push(c);

	custom.length += 3;
}
function tetrahedron2(a, b, c, d) {
    triangle2(a, b, c);
    triangle2(d, c, b);
    triangle2(a, d, b);
    triangle2(a, c, d);
}
//CSE470 attempting to do triangle strips
function strip(column1, column2){
	for(var i=0; i<column1.length; i++){
		custom.normalsArray.push(column1[i]);
		custom.normalsArray.push(column2[i]);
		
		custom.pointsArray.push(column1[i]);
		custom.pointsArray.push(column2[i]); 
	}
}
function cube(a, b, c, d, e, f, g, h){
	strip([b, a], [d, c]);
	strip([d, c], [h, g]);
	strip([h, g], [f, e]);
	strip([f, e], [b, a]);
	console.log(custom);
}

//CSE470 moved these to it functions to clean things up
function setProducts(object){
    ambientProduct = mult(lightAmbient, object.materialAmbient);
    diffuseProduct = mult(lightDiffuse, object.materialDiffuse);
    specularProduct = mult(lightSpecular, object.materialSpecular);
}
function setUniforms(program, object){
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(getLightPosition()) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),object.materialShininess );
	
	gl.uniform3fv( gl.getUniformLocation(program, "translation"), object.translation );
}

//CSE470 this returns the radius of the cylinder at given x value
function cylinder(x){
	return 2;
}

//CSE470 this returns radius of my custom shape at given x value
function customShape(x){
	return (Math.abs(Math.sin(x)) + 1) * 2;
}

//CSE470 calulates the points of the shape given a curve function
function createObject(curveFunction){
	var xmin = 1;
	var xmax = 10;
	for(var i = xmin; i<xmax; i++){
		console.log(curveFunction(i));
	}
}

//CSE470 animate the light
var x = 0;
function getLightPosition(){
	if(isLightAnimating){
		x += Math.PI / 250;
		return vec4(Math.cos(x), Math.sin(x), 0.0, 0.0 );
	}
	else{
		return vec4(0.0, -2.0, 0.0, 0.0 );
	}
	
}

window.onload = function init() {
	console.log("running");
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

	//CSE470 create two objects
    tetrahedron(va, vb, vc, vd);
    tetrahedron2(ua, ub, uc, ud);
	//cube(s1, s2, s3, s4, s5, s6, s7, s8);
	
	//CSE470 onclick function for buttons
    document.getElementById("ToggleLightColor").onclick = function(){
		//CSE470 changes the color of the light to white or purple depending on the current color
		var p = document.getElementById("TLCp");
		if(isLightWhite){
			p.innerHTML = "<strong>Light Color: </strong>Purple";
			console.log("setting light to purple");
			lightAmbient = lightColors['purple']['ambient'];
			lightDiffuse = lightColors['purple']['diffuse'];
			lightSpecular = lightColors['purple']['specular'];
			isLightWhite = !isLightWhite;
		}else{
			p.innerHTML = "<strong>Light Color: </strong>White";
			console.log("setting light to white");
			lightAmbient = lightColors['white']['ambient'];
			lightDiffuse = lightColors['white']['diffuse'];
			lightSpecular = lightColors['white']['specular'];
			isLightWhite = !isLightWhite;
		}
	};
    document.getElementById("ChangeMaterialProperty").onclick = function(){
		//CSE470 toggle material properties
		var p = document.getElementById("CMPp");
		if(currentPropertyValue == 0){
			p.innerHTML = "<strong>Materials: </strong>Gold & Red Plastic";
			cylinder.materialAmbient = currentProperty['setOne']['obj1']['ambient'];
			cylinder.materialDiffuse = currentProperty['setOne']['obj1']['diffuse'];
			cylinder.materialSpecular = currentProperty['setOne']['obj1']['specular'];
			cylinder.materialShininess = currentProperty['setOne']['obj1']['shininess'];
			
			custom.materialAmbient = currentProperty['setOne']['obj2']['ambient'];
			custom.materialDiffuse = currentProperty['setOne']['obj2']['diffuse'];
			custom.materialSpecular = currentProperty['setOne']['obj2']['specular'];
			custom.materialShininess = currentProperty['setOne']['obj2']['shininess'];
			currentPropertyValue = 1;
		}else if(currentPropertyValue == 1){
			p.innerHTML = "<strong>Materials: </strong>White Plastic & Green Rubber";
			cylinder.materialAmbient = currentProperty['setTwo']['obj1']['ambient'];
			cylinder.materialDiffuse = currentProperty['setTwo']['obj1']['diffuse'];
			cylinder.materialSpecular = currentProperty['setTwo']['obj1']['specular'];
			cylinder.materialShininess = currentProperty['setTwo']['obj1']['shininess'];
			
			custom.materialAmbient = currentProperty['setTwo']['obj2']['ambient'];
			custom.materialDiffuse = currentProperty['setTwo']['obj2']['diffuse'];
			custom.materialSpecular = currentProperty['setTwo']['obj2']['specular'];
			custom.materialShininess = currentProperty['setTwo']['obj2']['shininess'];
			currentPropertyValue = 2;
		}else if(currentPropertyValue == 2){
			p.innerHTML = "<strong>Materials: </strong>Silver & Jade";
			cylinder.materialAmbient = currentProperty['setThree']['obj1']['ambient'];
			cylinder.materialDiffuse = currentProperty['setThree']['obj1']['diffuse'];
			cylinder.materialSpecular = currentProperty['setThree']['obj1']['specular'];
			cylinder.materialShininess = currentProperty['setThree']['obj1']['shininess'];
			
			custom.materialAmbient = currentProperty['setThree']['obj2']['ambient'];
			custom.materialDiffuse = currentProperty['setThree']['obj2']['diffuse'];
			custom.materialSpecular = currentProperty['setThree']['obj2']['specular'];
			custom.materialShininess = currentProperty['setThree']['obj2']['shininess'];
			currentPropertyValue = 0;
		}
	};
	//CSE470 change rotation axis
    document.getElementById("ChangeSurfaceRotation").onclick = function(){
		if(axis == xAxis){
			axis = yAxis;
		}else if(axis == yAxis){
			axis = zAxis;
		}else if(axis == zAxis){
			axis = xAxis;
		}
	};
	//CSE470 toggle light animation
    document.getElementById("AnimateLight").onclick = function(){
		isLightAnimating = !isLightAnimating;
	};

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    render();
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	theta[axis] += 1.0;
    gl.uniform3fv(thetaLoc, theta);
	
	//CSE470 calculate eye positioning and orthographic view box
	modelViewMatrix = lookAt(eye, at , up);
	projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	
	//CSE470 draw cylinder
	setProducts(objects[0]);
	setUniforms(program, objects[0]);
	var nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(objects[0].normalsArray), gl.STATIC_DRAW );
	
	var vNormal = gl.getAttribLocation( program, "vNormal" );
	gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormal);

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(objects[0].pointsArray), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
			
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	var index = objects[0].length;
		
	for( var i=0; i<index; i+=3) 
		gl.drawArrays( gl.TRIANGLES, i, 3 );
	//Done drawing cylinder
	
	//CSE470 draw custom Object
	setProducts(objects[1]);
	setUniforms(program, objects[1]);
	var nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(objects[1].normalsArray), gl.STATIC_DRAW );
	
	var vNormal = gl.getAttribLocation( program, "vNormal" );
	gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormal);

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(objects[1].pointsArray), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
			
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	var index = objects[1].length;
		
	//CSE470 attempts to do triangle strips`
	//for(var i=0; i<index; i+=4)
	//	gl.drawArrays( gl.TRIANGLE_STRIP, i, 4);
	for( var i=0; i<index; i+=3) 
		gl.drawArrays( gl.TRIANGLES, i, 3);
	//Done drawing custom objects
	
    window.requestAnimFrame(render);
}
