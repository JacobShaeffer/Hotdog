var headId = 0;
var bodyId = 1;
var leftFrontUpperId = 2;
var leftFrontLowerId = 3;
var leftBackUpperId = 4;
var leftBackLowerId = 5;
var rightFrontUpperId = 6;
var rightFrontLowerId = 7;
var rightBackUpperId = 8;
var rightBackLowerId = 9;

var headHeight = 1.5;
var headWidth = 1.0;
var bodyHeight = 1.0;
var bodyWidth = 5.0;
var UpperHeight = -2.0;
var UpperWidth = 0.5;
var LowerHeight = -1.0;
var LowerWidth = 0.5;
var floorWidth = 100;
var floorHeight = 1;

var posX = 0.0;//2.0, 
var posZ = 0.0;//3.0;
var movePositive = false;
var moveX = true;
var bodyAngle = 180.0;

function updatePositions(){
	var bump;
	if(movePositive) bump = 0.1;
	else bump = -0.1;
	
	if(moveX) {
		posX += bump;
		if(posX > 1.0 || posX < -10.0) {
			moveX = false;
			//bodyAngle -= 90;
		}
	}
	else {
		posZ += bump;
		if(posZ > 7.0 || posZ < -7.0){
			moveX = true;
			movePositive = !movePositive;
			//bodyAngle -= 90;
		}
	}
}

function createNode(transform, render, sibling, child){
    var node = {
		transform: transform,
		render: render,
		sibling: sibling,
		child: child,
    }
    return node;
}

function initNodes(id) {
	var m = mat4();
	switch(id) {
		case bodyId:
			updatePositions();
			m = translate(posX, 0.0, posZ);
			m = mult(m, rotate(theta[bodyId], 0, 1, 0 ));
			figure[bodyId] = createNode( m, body, null, headId );
			break;
			
		case headId:
			m = translate(3.0, 0.0, 0.0);
			m = mult(m, rotate(theta[headId], 1, 0, 0));
			figure[headId] = createNode( m, head, leftFrontUpperId, null );
			break;
			
		case leftFrontUpperId:
			m = translate((bodyWidth/4), 0.0, -(bodyWidth/4));
			m = mult(m, rotate(theta[leftFrontUpperId], 0, 0, 1));
			figure[leftFrontUpperId] = createNode( m, leftFrontUpper, leftBackUpperId, leftFrontLowerId ); 
			break;
		case leftFrontLowerId:
			m = translate(0.0, UpperHeight, 0.0);
			m = mult(m, rotate(theta[leftFrontLowerId], 0, 0, 1));
			figure[leftFrontLowerId] = createNode( m, leftFrontLower, null, null ); 
			break;
			
		case leftBackUpperId:
			m = translate(-(bodyWidth/4), 0.0, -(bodyWidth/4));
			m = mult(m, rotate(theta[leftBackUpperId], 0, 0, 1));
			figure[leftBackUpperId] = createNode( m, leftBackUpper, rightFrontUpperId, leftBackLowerId ); 
			break;
		case leftBackLowerId:
			m = translate(0.0, UpperHeight, 0.0);
			m = mult(m, rotate(theta[leftBackLowerId], 0, 0, 1));
			figure[leftBackLowerId] = createNode( m, leftBackLower, null, null ); 
			break;
			
		case rightFrontUpperId:
			m = translate((bodyWidth/4), 0.0, (bodyWidth/4));
			m = mult(m, rotate(theta[rightFrontUpperId], 0, 0, 1));
			figure[rightFrontUpperId] = createNode( m, rightFrontUpper, rightBackUpperId, rightFrontLowerId ); 
			break;
		case rightFrontLowerId:
			m = translate(0.0, UpperHeight, 0.0);
			m = mult(m, rotate(theta[rightFrontLowerId], 0, 0, 1));
			figure[rightFrontLowerId] = createNode( m, rightFrontLower, null, null ); 
			break;
			
		case rightBackUpperId:
			m = translate(-(bodyWidth/4), 0.0, (bodyWidth/4));
			m = mult(m, rotate(theta[rightBackUpperId], 0, 0, 1));
			figure[rightBackUpperId] = createNode( m, rightBackUpper, null, rightBackLowerId ); 
			break;
		case rightBackLowerId:
			m = translate(0.0, UpperHeight, 0.0);
			m = mult(m, rotate(theta[rightBackLowerId], 0, 0, 1));
			figure[rightBackLowerId] = createNode( m, rightBackLower, null, null ); 
			break;
	}
}

function traverse(Id) {
	if(Id == null) return; 
	stack.push(modelViewMatrix);
	modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
	figure[Id].render();
	if(figure[Id].child != null) {
		traverse(figure[Id].child); 
	}
	modelViewMatrix = stack.pop();
	if(figure[Id].sibling != null) {
		traverse(figure[Id].sibling); 
	}
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*headHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function body() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*bodyHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( bodyWidth, bodyHeight, bodyWidth/2));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function leftFrontUpper(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*UpperHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( UpperWidth, UpperHeight, UpperWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function leftFrontLower(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*LowerHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( LowerWidth, LowerHeight, LowerWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function leftBackUpper(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*UpperHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( UpperWidth, UpperHeight, UpperWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function leftBackLower(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*LowerHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( LowerWidth, LowerHeight, LowerWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightFrontUpper(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*UpperHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( UpperWidth, UpperHeight, UpperWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightFrontLower(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*LowerHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( LowerWidth, LowerHeight, LowerWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightBackUpper(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*UpperHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( UpperWidth, UpperHeight, UpperWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function rightBackLower(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*LowerHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( LowerWidth, LowerHeight, LowerWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]); 
    pointsArray.push(vertices[b]); 
    pointsArray.push(vertices[c]);     
    pointsArray.push(vertices[d]);    
}

function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}