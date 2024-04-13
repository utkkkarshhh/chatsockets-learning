const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const path = require('path');
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
dotenv.config();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));

const PORT = process.env.PORT;

// Run when client connects;
io.on('connection', socket =>{ 

socket.on('joinRoom', ({username, room})=>{
	const user = userJoin(socket.id, username, room);

	socket.join(user.room);

	// Welcome current user
	socket.emit('notification', formatMessage('GhostMail', 'Welcome to GhostMail'));


	//Broadcast When user connects
	socket.broadcast.to(user.room).emit('notification', formatMessage('GhostMail', `${user.username} has joined the chat!`));
	
	io.to(user.room).emit('roomUsers', {
	room: user.room,
	users: getRoomUsers(user.room)
});

	});

// Listen for chat message
socket.on('chatMessage', msg => {
	const user = getCurrentUser(socket.id);
	io.to(user.room).emit('message', formatMessage(user.username, msg));
});

//When user disconnects
socket.on('disconnect', ()=>{
	const user = userLeave(socket.id);
	if(user){
		io.to(user.room).emit('notification', formatMessage('GhostMail', `${user.username} has left the chat!`));

		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room)
		});
	}
});

});


server.listen(PORT, ()=>{
    console.log(`App is live on port ${PORT}`);
});
