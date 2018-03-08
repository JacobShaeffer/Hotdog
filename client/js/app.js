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
var endingTurn;

function initialSetup(){
    isPlaying = false;

    //document.getElementById( "singlePlayer" ).addEventListener( "click", singlePlayerSetup, false );
    $( "#onlineMultiplayer" ).on( "click", multiplayerSelected);
    $( "#r1" ).on( "click", () => { join(); });
    $( "#r2" ).on( "click", () => { create(); });
    $( "#r3" ).on( "click", () => { join(); });//TODO:remove me
    $( "#endTurn" ).on( "click", endTurn);
    $( "#backOnline" ).on( "click", back);

    $( "#canvas" ).on( 'click', mouseInteractionHandler);
}

function singlePlayerSetup(){
    return;
}

function create(){
    console.log("create");
    if(!checkForUserName()) return;
    createRoom();
}

function join(){
    console.log("join");
    if(!checkForUserName()) return;
    let roomNumber = checkForRoomNumber();
    if(roomNumber == null) return;
    joinRoom(roomNumber);
}

function onCanJoinRoom( roomData, isTurn ){
    console.log("onCanJoinRoom: " + roomData.roomNumber);
    gameState = {
        currentPlayer: 0,//current player is always 0, show end turn will decide if this player is player 0 or not
        playerColors:[
            0xff0000,//player1 color
            0xffff00,//player2 color
        ],
        roomNumber: roomData.roomNumber,
        showEndTurn: isTurn,
        playerUserName: gameState.userName
    };

    playmode = ONLINEMULTIPLAYER;
    for(var element of document.querySelectorAll(".temporary")){
        element.style.display = "none";
    }
    document.getElementById( "online-overlay" ).style.display = "none";
    toggleEndTurnButton( isTurn );
    document.getElementById( "start-hidden" ).style.display = "inline-block";
    startPlaying();
}

function multiplayerSelected(){
    connectToServer((data) => {
        console.log(JSON.stringify(data));
        //set it up so the values of data are displayed next to each room button or something
    });
    document.getElementById( "main-overlay" ).style.display = "none";
    document.getElementById( "online-overlay" ).style.display = "inline-block";
}

function checkForRoomNumber(){
    var input = document.getElementById( "join-room-number" );
    console.log("Checking for RoomNumber: " + input.value);
    var roomNumber = input.value;
    if(roomNumber == ""){
        input.placeholder = "Enter RoomNumber";
        input.style.border = "1px solid #f00";
        return null;
    }
    else {
        return roomNumber;
    }
}

function checkForUserName(){
    var input = document.getElementById( "username-input" );
    console.log(input.value);
    var username = input.value;
    if(username == ""){
        input.placeholder = "Enter Username";
        input.style.border = "1px solid #f00";
        return false;
    }
    else {
        gameState.userName = username.substring(0,20);
        return true;
    }
}

function back(){
    document.getElementById( "online-overlay" ).style.display = "none";
    document.getElementById( "main-overlay" ).style.display = "inline-block";
    disconnect();
}


function convertColor( color ){
    //console.log(color.toString(16));
    return "#" + color.toString(16);
}

function startPlaying(){
    console.log("game has begun: " + JSON.stringify(gameState));
    resetGameBoard();
    isPlaying = true;
    controls.enabled = true;
}

function toggleEndTurnButton( show ){
    if(show){
        document.getElementById( "endTurn" ).style.display = "inline-block";
    }
    else{
        document.getElementById( "endTurn" ).style.display = "none";
    }
}

function selectViaNumber(number){
    if(selected != null){
        selected.material.color.set( 0x333333 );
    }
    selected = scene.children.find(function(child){
        if(child.number){
            if(child.number == number) return true;
        }
        return false;
    });
    selected.material.color.set( gameState.playerColors[gameState.currentPlayer] );
}


function endTurn(){
    if(endingTurn) return;
    if(selected == undefined) return;//TODO: inform player a cube must be selected
    endingTurn = true;
    selected.material.transparent = false;
    selected.isSelectable = false;
    var num = selected.number;
    addCube( num + 25, scene );
    selected = null;
    
    if(detectWinConditions( num, gameState.currentPlayer )){
        if(!gameState.showEndTurn){
            onGameOver(num);
        }
        gameOver();
    }
    else{
        if(!gameState.showEndTurn){
            onTurnHasEnded(num);
        }
        gameState.currentPlayer = gameState.currentPlayer == 0 ? 1 : 0;
        //switch(playmode){
        //    case SINGLEPLAYER:
        //        break;
        //    case ONLINEMULTIPLAYER:
        gameState.showEndTurn = !gameState.showEndTurn;
        toggleEndTurnButton( gameState.showEndTurn );
        //        break;
        //}
    }
    endingTurn = false;
}

function gameOver( ){
    controls.enabled = false;
    isPlaying = false;
    //TODO: ease the vertical rotation of the camera

    //TODO: finish this
    switch(playmode){
        case SINGLEPLAYER:
            break;
        case ONLINEMULTIPLAYER:
            break;
    }
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
            winner = i;
        }
    }
    for(var i=20; i>=13; i--){
        if(plusMinus[i] + plusMinus[20-i + 5] >= 3){
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
    if(gameState.showEndTurn == false){
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
        console.log(JSON.stringify(selected));
        selected.material.color.set( gameState.playerColors[gameState.currentPlayer] );
        if(gameState.playmode == ONLINEMULTIPLAYER){
            onHighlight(selected.number);
        }
    }

}

$(document).ready(function(){
    initialSetup();
    initializeGameBoard();
    animate();
});