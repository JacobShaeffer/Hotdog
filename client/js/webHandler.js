var socket;

function connectToServer(callback){
    socket = io();
}

//
// emit functions
//

function createRoom(){
    console.log("createRoom");
    socket.on('canJoinRoom', (roomData) => {
        console.log("canJoinRoom");
        onCanJoinRoom(roomData, false);
        socket.on('startGame', (data) => onGameStart(data));
        socket.on('updateGame', (updates) => onGameStateUpdate(updates));
    });
    socket.on('serverError', (error) => onServerError(error));
    socket.emit('createRoom', {username: gameState.username});
}

function joinRoom( roomNumber ) {
    console.log("joinRoom: " + roomNumber);
    socket.on('canJoinRoom', (roomData) => {
        console.log("canJoinRoom");
        onCanJoinRoom(roomData, true);
        socket.on('startGame', (data) => onGameStart(data));
        socket.on('updateGame', (updates) => onGameStateUpdate(updates));
    });
    socket.on('serverError', (error) => onServerError(error));
    socket.emit('joinRoom', {username: gameState.username, roomNumber: roomNumber});
}

function onHighlight(num){
    //TODO: implement me
    socket.emit('highlight', {
        roomNumber: gameState.roomNumber,
        num: num,
    });
}

function onTurnHasEnded(num){
    //TODO: implement me
    socket.emit('endTurn', {
        roomNumber: gameState.roomNumber,
        num: num,
    });
}

function onGameOver(num){
    //TODO: implement me
    socket.emit('gameOver', {
        roomNumber: gameState.roomNumber,
        num: num,
    });
}

function disconnect() {
    socket.disconnect();
}

//
// listeners
//

/**
 * used for communicating errors to the client
 * see server file for error syntax
 * @param {errorNumber: number, errorMessage: string} error 
 */
function onServerError(error) {
    console.log("There was an error: " + JSON.stringify(error));
    switch(error.errorCode){
        case 100:
            console.log("server error - errorCode: " + error.errorCode + " - errorMessage: " + error.errorMessage);
            break;
        case 200:
            console.log("server error - errorCode: " + error.errorCode + " - errorMessage: " + error.errorMessage);
            break;
    }
}

function onGameStateUpdate(updates) {
    console.log("onGameStateUpdate: " + JSON.stringify(updates));
    switch(updates.status){
        case 'gameOver':
            selectViaNumber(updates.number);
            endTurn();
            break;
        case 'highlight':
            selectViaNumber(updates.number);
            break;
        case 'camera':
            break;
        case 'endTurn':
            selectViaNumber(updates.number);
            endTurn();
            break; 
    }
}

/**
 * listens for the server to say the game has started
 * @param {player1: number} data 
 */
function onGameStart(data){

}