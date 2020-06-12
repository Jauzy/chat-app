const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const formatMessages = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
const botName = 'ChatCord'
const server = http.createServer(app)
const PORT = process.env.PORT || 3000
const io = socketio(server)

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//run when client connects
io.on('connection', socket => {
    //three types of emits
    //single client emit : socket.emit()
    //multi client except the one who connect : socket.broadcast.emit()
    //multi client including the one who connect : io.emit()
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        //socket io room
        socket.join(user.room)

        //welcome current user
        socket.emit('message', formatMessages(botName, 'Welcome to ChatCord!'))

        //broadcast when user connect
        socket.broadcast.to(user.room).emit('message', formatMessages(botName, username + ' has joined the chat'))

        //user in room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessages(user.username, msg))
    })
    //runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessages(botName, user.username + ' has left the chat'))
            //user in room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

server.listen(PORT, (err) => {
    if (err) console.log(err)
    else console.log(`Server running on port ${PORT}`)
})