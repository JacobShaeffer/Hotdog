"use strict"
//
// Game Controls and 
//

var isPlaying;
var playmode;
const SINGLEPLAYER = 0, LOCALMULTIPLAYER = 1, ONLINEMULTIPLAYER = 2;
var gameState = {};
var cubeIsSelected = [];
var autoRotateSpeed = 0.3;

function initialSetup(){
    isPlaying = false;

    
    firebase.database().ref('users/Your mother steve!').set({
        username: "your",
        email: "mother",
        age: "steve",
    })

    document.getElementById( "singlePlayer" ).addEventListener( "click", singlePlayerSetup, false );
    document.getElementById( "localMultiplayer" ).addEventListener( "click", localMultiplayerSetup, false );
    document.getElementById( "onlineMultiplayer" ).addEventListener( "click", onlineMultiplayerSetup, false );
    document.getElementById( "endTurn" ).addEventListener( "click", endTurn, false );
    document.addEventListener( 'click', mouseInteractionHandler, false);
}

function singlePlayerSetup(){
    return;
    UISetup( SINGLEPLAYER );
}

function localMultiplayerSetup(){
    gameState = {
        currentPlayer: 0,
        playerColors:[
            0xff0000,//player1 color
            0xffff00,//player2 color
        ],

    };
    UISetup( LOCALMULTIPLAYER );
    startPlaying();
}

function onlineMultiplayerSetup(){
    return;
    UISetup( ONLINEMULTIPLAYER );
}

function convertColor( color ){
    //console.log(color.toString(16));
    return "#" + color.toString(16);
}

function startPlaying(){
    resetGameBoard();
    isPlaying = true;
    controls.enabled = true;
}

function UISetup( playmodePARAM ){
    playmode = playmodePARAM;
    for(var element of document.querySelectorAll(".temporary")){
        element.style.display = "none";
    }
    for(var element of document.querySelectorAll(".start_hidden")){
        element.style.display = "inline-block";
    }
    switch(playmode){
        case SINGLEPLAYER:
            break;
        case LOCALMULTIPLAYER:
            document.getElementById( "turnDisplay" ).innerHTML = "Player One's Turn";
            document.getElementById( "turnDisplay" ).style.color = convertColor( gameState.playerColors[gameState.currentPlayer] );
            break;
        case ONLINEMULTIPLAYER:
            break;
    }
}

function endTurn(){
    //FIXME: don't allow a player to end their turn without selecting a cube    
    selected.material.transparent = false;
    selected.isSelectable = false;
    var num = selected.number;
    addCube( num + 25, scene );
    selected = null;
    
    if(detectWinConditions( num, gameState.currentPlayer )){
        gameOver();
    }
    else{
        gameState.currentPlayer = gameState.currentPlayer == 0 ? 1 : 0;
        switch(playmode){
            case SINGLEPLAYER:
                break;
            case LOCALMULTIPLAYER:
                document.getElementById( "turnDisplay" ).innerHTML = gameState.currentPlayer == 0 ? "Player One's Turn" : "Player Two's Turn";
                document.getElementById( "turnDisplay" ).style.color = convertColor( gameState.playerColors[gameState.currentPlayer] );
                break;
            case ONLINEMULTIPLAYER:
                break;
        }
    }
}

function gameOver( ){
    console.log("There is a winner");

    controls.enabled = false;
    isPlaying = false;
    //TODO: ease the vertical rotation of the camera
    //TODO: add reset button (maybe play again and main menu)
}

function detectWinConditions( latestSelected, player ){
    var x = latestSelected % 5.0;
    var y = Math.floor(latestSelected / 25.0);
    var z = Math.floor((latestSelected % 25) / 5.0);
    cubeIsSelected[x][y][z] = player;

    var plusMinus = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    for(var i=0; i<plusMinus.length; i++){
        var direction = i + Math.floor(i/13) + Math.floor(i/21);
        var xDir = direction % 3 - 1;
        var yDir = Math.floor(direction / 9) - 1;
        var zDir = Math.floor((direction % 9) / 3) - 1;
        
        plusMinus[i] += recurseThroughDirection( {x: x, y: y, z: z}, {x: xDir, y: yDir, z: zDir}, 0, player );
    }

    var winner = -1;
    for(var i=24; i>=21; i--){
        if(plusMinus[i] + plusMinus[24-i] >= 3){
            console.log("WINNER");
            winner = i;
        }
    }
    for(var i=20; i>=13; i--){
        if(plusMinus[i] + plusMinus[20-i + 5] >= 3){
            console.log("WINNER2");
            winner = i;
        }
    }
    if(plusMinus[4] >= 3){
        winner = 4;
    }

    if(winner >= 0){
        var direction = winner + Math.floor(winner/13) + Math.floor(winner/21);
        var xDir = direction % 3 - 1;
        var yDir = Math.floor(direction / 9) - 1;
        var zDir = Math.floor((direction % 9) / 3) - 1;
        
        x = (latestSelected % 5.0 - 2 + xDir) * 2.0;
        y = (Math.floor(latestSelected / 25.0) - 2 + yDir) * 2.0;
        z = (Math.floor((latestSelected%25) / 5.0) - 2 + zDir) * 2.0;
        console.log(JSON.stringify({x: xDir, y: yDir, z: zDir}));
        addRod( {x: x, y: y, z: z}, latestSelected, scene, gameState.currentPlayer );
        return true;
    }
    else return false;

}

function recurseThroughDirection( position, direction, total, player ){
    var newPosition = {
        x: position.x + direction.x,
        y: position.y + direction.y,
        z: position.z + direction.z,
    }
    if(outOfBounds( newPosition )) return total;
    if(cubeIsSelected[newPosition.x][newPosition.y][newPosition.z] != player) return total;
    return recurseThroughDirection( newPosition, direction, ++total, player );
}

function outOfBounds( position ){
    if(position.x < 0 || position.x >= cubeIsSelected.length) return true;
    if(position.y < 0 || position.y >= cubeIsSelected[position.x].length) return true;
    if(position.z < 0 || position.z >= cubeIsSelected[position.x][position.y].length) return true;
    return false;
}

function mouseInteractionHandler( event ) {
    if(isPlaying == false){
        return;
    }

    //FIXME: make me not suck

    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    
    raycaster.setFromCamera( mouse, camera );
    
    var intersects = raycaster.intersectObjects( scene.children );

    //console.log( intersects.length );    
    
    
    if(intersects.length > 0){
        //console.log(intersects[0].object.isSelectable);
        if(intersects[0].object.isSelectable == false){
            return;
        }
        if(selected != null){
            selected.material.color.set( 0x333333 );
        }
        selected = intersects[0].object;
        selected.material.color.set( gameState.playerColors[gameState.currentPlayer] );
        //console.log(JSON.stringify(selected.material));
    }

}


//
// Rendering functions and variables, and Camera Interaction Controls
//

var camera, scene;
var renderer, controls;
var raycaster, mouse;
var selected;
var plane;

function initializeGameBoard(){

    //
    // 3D scene
    //
    scene = null;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var canvas = document.getElementById( 'canvas' );
    renderer = new THREE.WebGLRenderer( {canvas: canvas} );
    var canvasWidth = window.innerWidth;//1.5;
    var canvasHeight = window.innerHeight;//1.5;//canvasWidth*3/4;
    renderer.setSize( canvasWidth, canvasHeight );//window.innerWidth, window.innerHeight );
    //document.body.appendChild( renderer.domElement );

    var light = new THREE.HemisphereLight( 0x505010, 0x080820, 1 );
    var ambientLight = new THREE.AmbientLight( 0xababab );
    scene.add( light );
    scene.add( ambientLight );
    
    
    for(var i=0; i<25; i++){
        addCube( i, scene );
    }
    //addPlane( scene );
    
    camera.position.z = 13;
    camera.position.y = 6;
    camera.position.x = 6;

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.rotateSpeed = 0.5;
    controls.enablePan = false;
    controls.maxDistance = 50;

    controls.enabled = isPlaying;

    var hudCanvas = document.createElement('canvas');
    hudCanvas.width = window.innerWidth;
    hudCanvas.height = window.innerHeight;
    var hudBitmap = hudCanvas.getContext('2d');
        
    window.addEventListener( 'resize', onWindowResize, false );
}

function resetGameBoard(){
    cubeIsSelected = new Array(5);
    for(var i=0; i<5; i++){
        cubeIsSelected[i] = new Array(5);
        for(var j=0; j<5; j++){
            cubeIsSelected[i][j] = new Array(5);
            for(var k=0; k<5; k++){
                cubeIsSelected[i][j][k] = -1;
            }
        }
    }
    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }
    controls.dispose();
    initializeGameBoard();
}

function addCube( number, scene ){
    if(number >= 125) return;
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshLambertMaterial( {color: 0x333333, transparent: true, opacity: 0.5} );

    var mesh = new THREE.Mesh( geometry, material, number );
    mesh.position.x = (number % 5.0 - 2) * 2.0;
    mesh.position.y = (Math.floor(number / 25.0) - 2) * 2.0;
    mesh.position.z = (Math.floor((number%25) / 5.0) - 2) * 2.0;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;

    scene.add( mesh );
}

/**
 * add a rod to the gameboard highlighting where the winning 4 cubes are
 * @param {Object} position the position of an adjacent cube that is part of the line of 4
 * @param {Number} number the winning cube's number (used to extract cube position)
 * @param {THREE.Scene} scene the THREE js Scene object to add the rod too
 * @param {Number} winner the id of the winning player
 */
function addRod( position, number, scene, winner ){
    var pointx = new THREE.Vector3( (number % 5.0 - 2) * 2.0, (Math.floor(number / 25.0) - 2) * 2.0, (Math.floor((number%25) / 5.0) - 2) * 2.0 );
    var pointy = position;
    var mesh = createCylinderBetween( pointx, pointy, winner );

    scene.add( mesh );
}

function createCylinderBetween( pointX, pointY, winner )
{
    //THIS FUNCTION IS A SLIGHTLY EDITED VERSION OF THIS STACKOVERFLOW ANSWER: https://stackoverflow.com/a/21807965
    //Thank you kon psych, thank you

    var direction = new THREE.Vector3().subVectors( pointY, pointX );
    var orientation = new THREE.Matrix4();
    orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
    var tempMat4 = new THREE.Matrix4();
    orientation.multiply(tempMat4.set(1,0,0,0,0,0,1,0,0,-1,0,0,0,0,0,1));

    var edgeGeometry = new THREE.CylinderGeometry( 0.25, 0.25, 1000, 8, 1);
    var edge = new THREE.Mesh( edgeGeometry, new THREE.MeshBasicMaterial( {color: gameState.playerColors[winner]} ) );

    edge.applyMatrix(orientation)
    var tempVec3 = new THREE.Vector3().addVectors( pointX, direction.multiplyScalar(0.5) );
    edge.position.x = tempVec3.x;
    edge.position.y = tempVec3.y;
    edge.position.z = tempVec3.z;

    return edge;
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    if(isPlaying == false){
        if(autoRotateSpeed < 0.3) autoRotateSpeed += 0.001667;
        controls.rotateLeft( autoRotateSpeed * Math.PI / 180 );
    }
    render();
}

function render() {
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

initialSetup();
initializeGameBoard();
animate();