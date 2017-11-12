var isPlaying;
var playmode;
const SINGLEPLAYER = 0, LOCALMULTIPLAYER = 1, ONLINEMULTIPLAYER = 2;

function initialSetup(){
    isPlaying = false;

    document.getElementById( "singlePlayer" ).addEventListener( "click", singlePlayerSetup, false );
    document.getElementById( "localMultiplayer" ).addEventListener( "click", localMultiplayerSetup, false );
    document.getElementById( "onlineMultiplayer" ).addEventListener( "click", onlineMultiplayerSetup, false );
}

function singlePlayerSetup(){
    return;
    UISetup( SINGLEPLAYER );
}

function localMultiplayerSetup(){
    UISetup( LOCALMULTIPLAYER );
}

function onlineMultiplayerSetup(){
    return;
    UISetup( ONLINEMULTIPLAYER );
}

function UISetup( playmodePARAM ){
    playmode = playmodePARAM;
    for(var element of document.querySelectorAll(".temporary")){
        element.style.zIndex = -1000;
    }
    document.querySelector(".hide").style.zIndex = 1000;
    switch(playmode){
        case SINGLEPLAYER:
            break;
        case LOCALMULTIPLAYER:
            break;
        case ONLINEMULTIPLAYER:
            break;
    }
    resetGameBoard();
    isPlaying = true;
    controls.enabled = true;
}

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
    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }
    initializeGameBoard();
}

function addCube( number, scene ){
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshLambertMaterial( { color: 0x333333, transparent: true, opacity: 0.5 } );

    var mesh = new THREE.Mesh( geometry, material, number );
    mesh.position.x = (number % 5.0 - 2) * 2.0;
    mesh.position.y = (Math.floor(number / 25.0) - 2) * 2.0;
    mesh.position.z =(Math.floor((number%25) / 5.0) - 2) * 2.0;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;

    scene.add( mesh );
}

function addPlane( camera ){
    var geometry = new THREE.PlaneGeometry( 5, 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x0044ff, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    camera.add(plane);
    plane.position.set( 0, 0, 2 );
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    if(isPlaying == false){
        controls.rotateLeft( 0.3 * Math.PI / 180 );
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

document.addEventListener( 'click', function( event ) {
    if(isPlaying == false){
        return;
    }
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    
    console.log("mouseClick");
    raycaster.setFromCamera( mouse, camera );
    
    var intersects = raycaster.intersectObjects( scene.children );
    
    if(intersects.length > 0){
        if(selected != null){
            selected.material.color.set( 0x333333 );
        }
        selected = intersects[0].object;
        selected.material.color.set( 0xff0000 );
        //console.log(JSON.stringify(selected.material));
        selected.material.transparent = false;
        addCube( selected.number + 25, scene );
    }

}, false);

initialSetup();
initializeGameBoard();
animate();