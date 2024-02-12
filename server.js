// Importar las dependencias necesarias
const express = require('express'); 
const app = express();

const path = require('path'); // Importar el módulo 'path' para manejar rutas de archivos
const http = require('http'); // Importar el módulo 'http' de Node.js para crear el servidor HTTP
const {Server} = require('socket.io'); // Importar la clase 'Server' de Socket.IO para la comunicación en tiempo real

// Crear un servidor HTTP utilizando la aplicación Express
const server = http.createServer(app);

// Crear una instancia de Socket.IO que escuche en el servidor HTTP
const io = new Server(server);

// Configurar Express para servir archivos estáticos desde la carpeta raíz del proyecto
app.use(express.static(path.resolve('')));

// Definir una ruta para la página de inicio
app.get('/', (req, res) => {
    return res.sendFile('index.html'); // Enviar el archivo 'index.html' al cliente
});

const playingLimit = 3; // Controlar la cantidad máxima de partidas que se pueden jugar simultáneamente.

let userNameArray = []; // Array para almacenar los nombres de usuario
let playingArray = []; // Array para almacenar las partidas en curso
let waitingArray = []; // Array para almacenar las partidas en espera
let removedFromWaiting = false; // Bandera para controlar si se ha eliminado un usuario de las partidas en espera

// Manejar la conexión de un cliente a través de Socket.IO
io.on('connection', (socket) => {
    // Manejar el evento 'find' para buscar una partida disponible
    socket.on('find', (e) => {
        if(e.name !== null){
            userNameArray.push(e.name);

            if(userNameArray.length >= 2){
                // Crear objetos para los dos jugadores de la partida
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

                // Verificar si hay espacio disponible para una nueva partida
                if(playingArray.length < playingLimit){ 
                    playingArray.push(obj);
                    console.log(`Matched: ${obj.p1.name} vs ${obj.p2.name}`);
                    io.emit('find', {players: playingArray}); // Emitir un evento con la información de las partidas en curso
                }
                else{
                    waitingArray.push(obj); // Agregar la partida al array de partidas en espera
                }

                userNameArray.splice(0,2) // Eliminar los nombres de usuario utilizados de la lista
            }
        }
    })

    // Manejar el evento 'nextPair' para emparejar a los jugadores en espera con nuevas partidas disponibles
    socket.on('nextPair', (e) => {
        if(e !== undefined && playingArray.length < playingLimit){
            playingArray.push(e.nextPair); // Agregar la nueva partida al array de partidas en curso
            console.log(`Matched: ${e.nextPair.p1.name} vs ${e.nextPair.p2.name}`);
            io.emit('find', {players: playingArray}); // Emitir un evento con la información de las partidas en curso
        }
    })

    // Manejar el evento 'playing' para actualizar el estado de la partida en curso
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

        io.emit('playing', {players: playingArray}); // Emitir un evento con la información actualizada de las partidas en curso
    })

    // Manejar el evento 'gameOver' para finalizar una partida
    socket.on('gameOver', (e) => {
        playingArray = playingArray.filter(obj => obj.p1.name != e.name); // Eliminar la partida finalizada del array de partidas en curso

        if (waitingArray.length > 0){
            if (removedFromWaiting === false){
                let nextPair = waitingArray[0]; // Obtener la próxima partida en espera
                waitingArray = waitingArray.filter(obj => obj.p1.name != nextPair.p1.name); // Eliminar la partida emparejada del array de partidas en espera
                io.emit('nextPair', {nextPair: nextPair}); // Emitir un evento para emparejar a los jugadores en espera con la nueva partida disponible
            }
            
            removedFromWaiting = !removedFromWaiting; // Cambiar el estado de la bandera
        }
    })

    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
  
// Escuchar en el puerto 3000
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
