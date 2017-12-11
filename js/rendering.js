"use strict"
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
    if(playmode == SINGLEPLAYER){
        isCubeSelectable = [];
        for(var i=0; i<25; i++){
            isCubeSelectable.push(0);
        }
    }
    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }
    controls.dispose();
    initializeGameBoard();
}

function addCube( number, scene ){
    if(number >= 125) {
        if(playmode == SINGLEPLAYER){
            isCubeSelectable[number % 5] = -1;
        }
        return;
    }
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshLambertMaterial( {color: 0x333333, transparent: true, opacity: 0.5} );

    var mesh = new THREE.Mesh( geometry, material, number );
    mesh.position.x = (number % 5.0 - 2) * 2.0;
    mesh.position.y = (Math.floor(number / 25.0) - 2) * 2.0;
    mesh.position.z = (Math.floor((number%25) / 5.0) - 2) * 2.0;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;

    scene.add( mesh );

    if(playmode == SINGLEPLAYER){
        isCubeSelectable[number % 5]++;
    }
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