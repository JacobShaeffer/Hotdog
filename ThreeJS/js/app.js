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


    gameState = {
        currentPlayer: 0,//this needs to be set according to who is decided to go first
        playerColors:[],//assign colors based on first or second player
        
    };
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

initialSetup();
initializeGameBoard();
animate();