const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')

const youtube = require('./services/youtube')
const twitch = require('./services/twitch')

server.listen(3000)

app.get('/', async (req, res) => { res.sendFile(path.join(__dirname, 'resources/chat.html')) })

io.on('connection', (socket) => console.log('Client connected:', socket.id))

let emitMessage = message => io.emit('message', message)

youtube.listen(emitMessage)
twitch.listen(emitMessage)
