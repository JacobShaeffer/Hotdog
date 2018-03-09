"use strict"
//
// Game Controls and 
//

var isPlaying;
var playmode;
const SINGLEPLAYER = 0, LOCALMULTIPLAYER = 1, ONLINEMULTIPLAYER = 2;
var gameState = {};
var cubeIsSelected = [];
var isCubeSelectable = [];
var autoRotateSpeed = 0.3;
var backFrom;
var endingTurn;

function initialSetup(){
    isPlaying = false;
    
    setFirebaseDB();

    document.getElementById( "singlePlayer" ).addEventListener( "click", singlePlayerSetup, false );
    document.getElementById( "localMultiplayer" ).addEventListener( "click", localMultiplayerSetup, false );
    document.getElementById( "onlineMultiplayer" ).addEventListener( "click", multiplayerSelected, false );
    document.getElementById( "endTurn" ).addEventListener( "click", endTurn, false );
    document.getElementById( "createRoom" ).addEventListener( "click", createSelected, false );
    document.getElementById( "joinRoom" ).addEventListener( "click", joinSelected, false );
    document.getElementById( "backOnline" ).addEventListener( "click", back, false );
    //document.getElementById( "privateRoom" ).addEventListener( "click", createPrivateRoom, false );
    //document.getElementById( "publicRoom" ).addEventListener( "click", createPublicRoom, false );
    //document.getElementById( "backCreate" ).addEventListener( "click", back, false );
    //document.getElementById( "randomRoom" ).addEventListener( "click", joinRandomRoom, false );
    //document.getElementById( "selectRoom" ).addEventListener( "click", joinSelectedRoom, false );
    //document.getElementById( "backJoin" ).addEventListener( "click", back, false );
    document.addEventListener( 'click', mouseInteractionHandler, false);
}

function singlePlayerSetup(){
    return;
    var isHumanPlayerFirst = Math.floor(Math.random() * 2) == 0;//determine if the player is player 0 or 1
    gameState = {
        currentPlayer: 0,
        ai: isHumanPlayerFirst ? 1 : 0,
        showEndTurn: isHumanPlayerFirst,
        playerColors:[
            0xff0000,//player1 color
            0xffff00,//player2 color
        ],
    };
    playmode = SINGLEPLAYER;
    for(var element of document.querySelectorAll(".temporary")){
        element.style.display = "none";
    }
    //TODO: determine who goes first
    //
    
    toggleEndTurnButton( isHumanPlayerFirst );
    var turnDisplay = document.getElementById( "turn-display" );
    turnDisplay.innerHTML = isHumanPlayerFirst ? "Your Turn" : "Computer's Turn";
    turnDisplay.style.color = convertColor( gameState.playerColors[gameState.currentPlayer] );
    document.getElementById( "start-hidden" ).style.display = "inline-block";   
    startPlaying();
    initializeAi( 2 );
    if(!isHumanPlayerFirst){
        //console.log("running AI turn");
        aiTurn();
    }
}

function localMultiplayerSetup(){
    gameState = {
        currentPlayer: 0,
        playerColors:[
            0xff0000,//player1 color
            0xffff00,//player2 color
        ],
    };
    playmode = LOCALMULTIPLAYER;
    for(var element of document.querySelectorAll(".temporary")){
        element.style.display = "none";
    }
    toggleEndTurnButton(true);
    var turnDisplay = document.getElementById( "turn-display" );
    turnDisplay.innerHTML = "Player One's Turn";
    turnDisplay.style.color = convertColor( gameState.playerColors[gameState.currentPlayer] );
    document.getElementById( "start-hidden" ).style.display = "inline-block";    
            
    startPlaying();
}

function onlineMultiplayerCreateSetup( roomNumber ){
    gameState = {
        currentPlayer: 0,//current player is always 0, show end turn will decide if this player is player 0 or not
        playerColors:[
            0xff0000,//player1 color
            0xffff00,//player2 color
        ],
        roomNumber: roomNumber,
        showEndTurn: false,
        userName: gameState.userName,
    };

    playmode = ONLINEMULTIPLAYER;
    for(var element of document.querySelectorAll(".temporary")){
        element.style.display = "none";
    }
    //document.getElementById( "create-room-overlay" ).style.display = "none";
    document.getElementById( "online-overlay" ).style.display = "none";
    toggleEndTurnButton( false );
    document.getElementById( "start-hidden" ).style.display = "inline-block";
    //TODO: add appropriate ui elements
}

function onlineMultiplayerJoinSetup( roomNumber, showEndTurn, oponantName ){
    gameState = {
        currentPlayer: 0,//current player is always 0, show end turn will decide if this player is player 0 or not
        playerColors:[
            0xff0000,//player1 color
            0xffff00,//player2 color
        ],
        roomNumber: roomNumber,
        oponantUserName: oponantName,
        showEndTurn: showEndTurn,
        userName: gameState.userName,
    };

    playmode = ONLINEMULTIPLAYER;
    for(var element of document.querySelectorAll(".temporary")){
        element.style.display = "none";
    }
    //document.getElementById( "join-room-overlay" ).style.display = "none";
    toggleEndTurnButton( showEndTurn );
    document.getElementById( "start-hidden" ).style.display = "inline-block";
    //TODO: add appropriate ui elements
}

function multiplayerSelected(){
    backFrom = "multiplayer";
    document.getElementById( "main-overlay" ).style.display = "none";
    document.getElementById( "online-overlay" ).style.display = "inline-block";
}

function createSelected(){
    if(checkForUserName() == false) return;
    //backFrom = "create";
    //document.getElementById( "online-overlay" ).style.display = "none";
    //document.getElementById( "create-room-overlay" ).style.display = "inline-block";
    createRoom();
}

function joinSelected(){
    if(checkForUserName() == false) return;
    let roomNumber = checkForRoomNumber();
    if(roomNumber == false) return;
    checkRoomExists(roomNumber);
    //backFrom = "join";
    //document.getElementById( "online-overlay" ).style.display = "none";
    //document.getElementById( "join-room-overlay" ).style.display = "inline-block";
}

function checkForRoomNumber(){
    var input = document.getElementById( "room-number-input" );
    var roomNumber = input.value;
    if(roomNumber == ""){
        input.style.border = "1px solid #f00";
        return false;
    }
    else {
        return parseInt(roomNumber);
    }
}

function checkForUserName(){
    var input = document.getElementById( "username-input" );
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
    switch(backFrom){
        case "multiplayer":
            document.getElementById( "online-overlay" ).style.display = "none";
            document.getElementById( "main-overlay" ).style.display = "inline-block";
            break;
        case "create":
            document.getElementById( "create-room-overlay" ).style.display = "none";
            document.getElementById( "online-overlay" ).style.display = "inline-block";
            backFrom = "multiplayer";
            break;
        case "join":
            document.getElementById( "join-room-overlay" ).style.display = "none";
            document.getElementById( "online-overlay" ).style.display = "inline-block";
            backFrom = "multiplayer";
            break;
    }
}


function convertColor( color ){
    //console.log(color.toString(16));
    return "#" + color.toString(16);
}

function startPlaying(){
    //console.log("game has begun: " + JSON.stringify(gameState));
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

function aiEndTurn(){
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
        gameState.showEndTurn = !gameState.showEndTurn;
        toggleEndTurnButton( gameState.showEndTurn );
        document.getElementById( "turn-display" ).innerHTML = "Your Turn";
        document.getElementById( "turn-display" ).style.color = convertColor( gameState.playerColors[gameState.currentPlayer] );
    }
}

function endTurn(){
    if(endingTurn) return;
    if(selected == undefined) return;   
    endingTurn = true;
    selected.material.transparent = false;
    selected.isSelectable = false;
    var num = selected.number;
    addCube( num + 25, scene );
    selected = null;
    
    if(detectWinConditions( num, gameState.currentPlayer )){
        if(playmode == ONLINEMULTIPLAYER) setLastSelected( gameState.roomNumber, num );
        gameOver();
    }
    else{
        gameState.currentPlayer = gameState.currentPlayer == 0 ? 1 : 0;
        switch(playmode){
            case SINGLEPLAYER:
                gameState.showEndTurn = !gameState.showEndTurn;
                toggleEndTurnButton( gameState.showEndTurn );
                document.getElementById( "turn-display" ).innerHTML = "Computer's Turn";
                document.getElementById( "turn-display" ).style.color = convertColor( gameState.playerColors[gameState.currentPlayer] );
                endingTurn = false;
                //console.log("running AI turn");
                aiTurn();
                return;
            case LOCALMULTIPLAYER:
                document.getElementById( "turn-display" ).innerHTML = gameState.currentPlayer == 0 ? "Player One's Turn" : "Player Two's Turn";
                document.getElementById( "turn-display" ).style.color = convertColor( gameState.playerColors[gameState.currentPlayer] );
                break;
            case ONLINEMULTIPLAYER:
                setLastSelected( gameState.roomNumber, num );
                //Toggle player control
                //toggle value of turn display
                gameState.showEndTurn = !gameState.showEndTurn;
                toggleEndTurnButton( gameState.showEndTurn );
                break;
        }
    }
    endingTurn = false;
}

function gameOver( ){
    //console.log("There is a winner");

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
            //console.log("WINNER");
            winner = i;
        }
    }
    for(var i=20; i>=13; i--){
        if(plusMinus[i] + plusMinus[20-i + 5] >= 3){
            //console.log("WINNER2");
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
        //console.log(JSON.stringify({x: xDir, y: yDir, z: zDir}));
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
        selected.material.color.set( gameState.playerColors[gameState.currentPlayer] );
        console.log("selected number: " + selected.number);
    }

}

function selectViaNumber(number){
    console.log("selectViaNumber: " + number);
    if(selected != null){
        selected.material.color.set( 0x333333 );
    }
    selected = scene.children.find(function(child){
        if(child.number){
            if(child.number == number) return true;
        }
        return false;
    });
    if(!selected){
        console.log("unable to select Number: " + number);
        return;
    }
    selected.material.color.set( gameState.playerColors[gameState.currentPlayer] );
}

initialSetup();
initializeGameBoard();
animate();