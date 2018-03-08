var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

var roomDictionary = {};
var playerDictionary = {};

function createNewRoom(){
	let roomNum;
	
	do{
		roomNum = Math.floor(Math.random()*10000);
	} while(roomDictionary.hasOwnProperty(roomNum.toString()));

	return roomNum;
}

io.on('connection', (socket) => {
	console.log("+User " + socket.id + " has connected");
		
	socket.on('createRoom', (data) => {

		//TODO: handle possible errors

		let roomNumber = createNewRoom();
		roomDictionary[roomNumber.toString()] = {
			playerOne: socket.id,
			playerTwo: null,
			playerOne_UserName: data.username,
			playerTwo_UserName: null,
			gameState: [],
			roomNumber: roomNumber,
		}

		playerDictionary[socket.id] = {opponant: null, roomNumber: roomNumber};

		socket.emit('canJoinRoom', {roomNumber: roomNumber});
		console.log("new room created");
	});

	socket.on('joinRoom', (data) => {
		console.log("player attempting to join room: " + JSON.stringify(data));
		
		if(!roomDictionary.hasOwnProperty(data.roomNumber)){
			socket.emit('serverError', {errorCode: 200, errorMessage: "roomNumber not found"});
			return;
		}

		roomDictionary[data.roomNumber.toString()].playerTwo = socket.id;
		roomDictionary[data.roomNumber.toString()].playerOne_UserName = data.username;
		playerDictionary[socket.id] = {opponant: roomDictionary[data.roomNumber.toString()].playerOne, roomNumber: data.roomNumber};
		playerDictionary[roomDictionary[data.roomNumber.toString()].playerOne].opponant = socket.id;
		socket.emit('canJoinRoom', {roomNumber: data.roomNumber});
		console.log("player joined room: " + JSON.stringify(data));
	});

	//TODO: tell both players the game can start and who is going first.

	//@param cube - contains what cube was highlighted by the current player
    socket.on('gameOver', function(data){
		console.log("gameOver: " + data.num);
		changeGamSetate(socket.id, roomDictionary[data.roomNumber.toString()].playerOne, data.roomNumber, data.num);
		socket.broadcast.to(playerDictionary[socket.id].opponant).emit('updateGame', {
			status: 'gameOver',
			number: data.num,
		});
	});
	
	//@param cube - contains what cube was highlighted by the current player
	socket.on('highlight', function(cube){
		console.log("highlight: " + cube.num);
		socket.broadcast.to(playerDictionary[socket.id].opponant).emit('updateGame', {
			status: 'highlight',
			number: cube.num,
		});
	});

	//@param camera - contains the position of the camera (in world space?) that the current player has moved to
	socket.on('camera', function(camera){
		socket.broadcast.to(playerDictionary[socket.id].opponant).emit('updateGame', {
			status: 'camera',
			camera: {...camera},
		});
	});

	//@param cube - contains what cube was selected at end of turn by the current player
    socket.on('endTurn', function(cube){
		console.log("endTurn: " + cube.num);
		changeGamSetate(socket.id, roomDictionary[data.roomNumber.toString()].playerOne, data.roomNumber, data.num);
		socket.broadcast.to(playerDictionary[socket.id].opponant).emit('updateGame', {
			status: 'endTurn',
			number: data.num,
		});
	});

	
	function changeGamSetate(senderID, playerOneID, roomNumber, number){
		if(senderID == playerOneID){
			roomDictionary[roomNumber.toString()].gameState[number] = 1;
		}
		else{
			roomDictionary[roomNumber.toString()].gameState[number] = 2;
		}
	}
    

	socket.on('disconnect', function(){
		console.log("-User " + socket.id + " has disconnected");	
		//TODO:
		if(typeof playerDictionary[socket.id] == "undefined") return;

		if(playerDictionary[socket.id].opponant == null){
			//there was never another person or the other person has left
			if(typeof playerDictionary[socket.id].roomNumber != "undefined") 
				delete roomDictionary[playerDictionary[socket.id].roomNumber];
			delete playerDictionary[socket.id];
			return;
		}

		let opponantID = playerDictionary[socket.id].opponant;
		delete playerDictionary[socket.id];
		playerDictionary[opponantID].opponant = null;
		socket.broadcast.to(opponantID).emit('serverError', {errorCode: 100, errorMessage: "The other player has left the game."});
	});
});

app.use(express.static(path.join(__dirname, "client")));



server.listen(8080, () => {
    console.log("Server is listening on port 8080.");
});