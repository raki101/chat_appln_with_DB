
const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');

// get username & room using querystring

const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

const socket = io();

//join room
socket.emit('joinRoom',{username,room})

//get room and users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message',message =>{
    console.log(message);
    outputmsg(message);
    chatMessage.scrollTop = chatMessage.scrollHeight;

})

//message submit

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    //get text
    const msg = e.target.elements.msg.value;
    
    //emitting message
    socket.emit('chatMessage',msg);

    //clear input
    e.target.elements.msg.value = "";
})

function outputmsg(message)
{
    const div = document.createElement('div')
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
   
}

//add room name 
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

function outputRoomName(room)
{
    roomName.innerText = room;
}


function outputUsers(users)
{
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}