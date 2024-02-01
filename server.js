const express = require('express');
const app = express();

const path = require('path');
const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer(app);

const io = new Server(server);
app.use(express.static(path.resolve('')));

app.get('/', (req, res) => {
    return res.sendFile('index.html');
});

let userNameArray = [];
let playingArray = [];

io.on('connection', (socket) => {
    socket.on('find', (e) => {
        if(e.name !== null){
            userNameArray.push(e.name);

            if(userNameArray.length >= 2){
                let p1obj = {
                    name: userNameArray[0],
                    value: 'X',
                    markedPosition:''
                }
                let p2obj = {
                    name: userNameArray[1],
                    value: 'O',
                    markedPosition:''
                }

                let obj = {
                    p1: p1obj,
                    p2: p2obj,
                    sum: 1
                }

                playingArray.push(obj);

                userNameArray.splice(0,2)

                console.log(`Matched: ${obj.p1.name} vs ${obj.p2.name}`);
                io.emit('find', {players: playingArray});
            }
        }
    })

    socket.on('playing', (e) => {
        if(e.value === 'X'){
            let objToChange = playingArray.find(obj => obj.p1.name === e.name);
            objToChange.p1.markedPosition = e.id;
            objToChange.sum++;
        }
        else if(e.value === 'O'){
            let objToChange = playingArray.find(obj => obj.p2.name === e.name);

            objToChange.p2.markedPosition = e.id;
            objToChange.sum++;
        }

        io.emit('playing', {players: playingArray});
    })

    socket.on('gameOver', (e) => {
        playingArray = playingArray.filter(obj => obj.p1.name != e.name);
    })

    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
  
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
