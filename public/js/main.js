const socket = io()
const chatForm = document.getElementById('chat-form')
const chatMessage = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//get username from url query string parameter
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

//join chat room
socket.emit('joinRoom', { username, room })

//get room users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

//message from server
socket.on('message', message => {
    outputMessage(message)

    //scroll down 
    chatMessage.scrollTop = chatMessage.scrollHeight
})

//message submit from chat-form
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = e.target.elements.msg.value

    //emit msg to server
    socket.emit('chatMessage', msg)
    //clearinput
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

//output message to DOM
const outputMessage = (message) => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    `
    document.querySelector('.chat-messages').appendChild(div)
}

const outputRoomName = (room) => {
    roomName.innerText = room
}

const outputUsers = (users) => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}