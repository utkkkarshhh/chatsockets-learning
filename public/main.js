const chatForm = document.getElementById('chatForm');
const chatMessages = document.querySelector('.msger-chat');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username nad room fromURL

const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

//Join Chatroom

socket.emit('joinRoom', {username, room});

//Get room and users
socket.on('roomUsers', ({room, users})=>{
  outputRoomName(room);
  outputUsers(users);
});


// Message from server
socket.on('message', message =>{
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


socket.on('notification', notification =>{
  updateNotificationText(notification);
  chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message Submission
chatForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const msg = e.target.elements.message.value;
  
  //Emit message to server
  socket.emit('chatMessage', msg);
  e.target.elements.message.value = "";
  e.target.elements.message.focus();
})

//Output message to DOM
const outputMessage = (message) =>{
  const div = document.createElement('div');
  div.classList.add('msg', 'left-msg');
  div.innerHTML = `<div class="msg left-msg">
      <div
       class="msg-img"
       style="background-image: url()"
      ></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${message.username}</div>
          <div class="msg-info-time">${message.time}</div>
        </div>

        <div class="msg-text">
          ${message.text}
        </div>
      </div>
    </div>`;
    chatMessages.appendChild(div);
}

const updateNotificationText = (notification) => {
      const div = document.createElement('div');
      div.classList.add('notification');
       div.textContent = notification.text; 
        chatMessages.appendChild(div);
};

//Add room name to DOM

const outputRoomName = (room) =>{
  roomName.innerText = room;
}


// Add users to DOM
const outputUsers = (users) =>{
 userList.innerHTML = `${users.map(user => `${user.username}`)}`
}