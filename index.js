const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');
const app =express();
const mongoose = require('mongoose');
const moment = require('moment');

var d = new Date();
//DATABASE CONNECTION
mongoose.connect("mongodb://localhost:27017/charcordDB");

const textSchema = 
{
    RoomName:String,
    UserName:String,
    Message:String,
    Time:String
};

const bot = mongoose.model("chatmsgs",textSchema);


const server = app.listen('4000',()=>
    console.log("server running"));
    
const io = socketio(server);
app.use(express.static('public'));
    
const botname  = 'TOBIBOT';
io.on('connection',socket=>{
    console.log("new WS connection")

    socket.on('joinRoom',({username,room})=>{

        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
            //welcome current user
    socket.emit('message',formatMessage(botname,'Welcome to Chatcode'));

    //broadcasting when user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botname,`${user.username} has joined the chat`));
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)

        })    
    })


    //runs when user disconnects
    socket.on('disconnect',()=>{
    
        const user = userLeave(socket.id);
        if(user)
        { 
     io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`));   
     io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)

    }) 
    }})

    //chat messages
    
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
        //
        //h = formatMessage();
        const it = new bot({
            Message:msg,
            RoomName:user.room,
            UserName:user.username,
            Time:d.toLocaleTimeString()
        })
        it.save();   
    })

})