var socket;

function connectToServer(callback){
    socket = io();
    socket.on('population', (data) => callback(data));
}

//
// emit functions
//

function joinRoom( roomNumber ) {
    socket.emit('joinRoom', {username: gameState.username, room: roomNumber});
    socket.on('updateGame', (updates) => onGameStateUpdate(updates));
    socket.on('updatechat', (updates) => onChatUpdate(updates));
}

function sendMessage( message ) {
    socket.emit('sendMessage', message);
}

//
// listeners
//

function onGameStateUpdate(updates) {
    console.log("onGameStateUpdate: " + JSON.stringify(updates));
}

function onChatUpdate(updates) {
    console.log("onChatUpdate: " + JSON.stringify(updates));
}
