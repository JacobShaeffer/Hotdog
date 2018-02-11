var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

var roomVolume = [0, 0, 0];//a list of all rooms being used
var roomData = [
	{
		roomNumber: 1,
	},
	{

	},
	{

	}
]
var players = {};

io.on('connection', (socket) => {
	console.log("User " + socket.id + " has connected");
	socket.emit('population', {'pop': players.length});
		

	socket.on('joinRoom', (data) => {
		socket.username = data.username;
		socket.room = data.room;
		players[data.username] = {username: data.username};
		socket.join(data.room);
        socket.emit('updatechat', {'SERVER': 'you have connected to room ' + data.room});
		socket.broadcast.to(data.room).emit('updatechat', 'SERVER', data.username + ' has connected to this room');
		console.log(JSON.stringify(players));
	});

	socket.on('sendMessage', (data) => {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('gameOver', () => {

    });

    socket.on('endTurn', (data) => {

    });

    

	socket.on('disconnect', () => {
        delete players[socket.username];
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		socket.leave(socket.room);
	});
});

app.use(express.static(path.join(__dirname, "client")));



server.listen(8080, () => {
    console.log("Server is listening on port 8080.");
});