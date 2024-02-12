// Establecer la conexión con el servidor de Socket.IO
const socket = io();

var userName; // Variable para almacenar el nombre de usuario

// Función para encontrar un jugador y comenzar el juego
const findPlayer = () => {
    userName = document.getElementById("name").value; // Obtener el nombre de usuario del input

    document.getElementById("user").innerText = userName; // Mostrar el nombre de usuario en la interfaz

    // Verificar si se proporcionó un nombre de usuario válido
    if(userName === null || userName === ''){
        alert("Se necesita un nombre para iniciar la partida.");
    }
    else{
        // Emitir un evento 'find' con el nombre de usuario al servidor
        socket.emit('find', {name:userName});

        // Mostrar el contenido de carga en la interfaz
        showContentById('loading')

        // Deshabilitar el botón de búsqueda para evitar múltiples solicitudes
        document.getElementById('find').disabled=true;
    }
}

// Manejar el evento 'find' del servidor
socket.on('find', (e) => {
    let playersArray = e.players
    
    // Encontrar la partida en la que está involucrado el usuario actual
    const foundObj = playersArray.find(obj => obj.p1.name === `${userName}` || obj.p2.name === `${userName}`)
    
    if(foundObj == null){
        return;
    }

    console.log(playersArray);

    // Mostrar los elementos relacionados con el juego en la interfaz
    showContentById('userCont');
    showContentById('oppUserCont');
    showContentById('valueCont');
    showContentById('oppnValueCont');
    showContentById('container');
    showContentById('turn');

    // Ocultar el contenido de carga y los elementos relacionados con la entrada de nombre
    hideContentById('loading');
    hideContentById('name');
    hideContentById('find');
    hideContentById('nameTextHint');

    // Establecer el mensaje de turno para el jugador 'X'
    document.getElementById('turn').innerText = 'Turno de X';

    let oppName
    let value

    // Determinar el oponente y el valor del jugador actual
    foundObj.p1.name === userName ? oppName = foundObj.p2.name : oppName = foundObj.p1.name;
    foundObj.p2.name === userName ? value = foundObj.p2.value : value = foundObj.p1.value;

    // Mostrar el nombre del oponente y el valor del jugador actual en la interfaz
    document.getElementById('oppUser').innerText = oppName;
    document.getElementById('value').innerText = value;
    document.getElementById('oppnValue').innerText = value == 'O' ? 'X' : 'O';
    
    // Habilitar o deshabilitar los botones según el turno del jugador actual
    if (value != document.getElementById('turn').innerText.split(' ').slice(-1)){
        changeButtonState(true);
    }
    else{
        changeButtonState(false);
    }
})

// Agregar un event listener a todos los botones del juego
document.querySelectorAll('.btn').forEach(e => {
    e.addEventListener('click', function() {
        let value = document.getElementById('value').innerText;
        e.innerText = value;

        // Emitir un evento 'playing' con la jugada actual al servidor
        socket.emit('playing', {value: value, id: e.id, name: userName});
    })
})

// Manejar el evento 'playing' del servidor
socket.on('playing', (e) => {

    const foundObj = (e.players).find(obj => obj.p1.name === `${userName}` || obj.p2.name === `${userName}`)

    if(foundObj == null){
        return;
    }

    p1MarkedPosition = foundObj.p1.markedPosition;
    p2MarkedPosition = foundObj.p2.markedPosition;

    // Establecer el mensaje de turno según el estado del juego
    if ((foundObj.sum) % 2 === 0){
        document.getElementById('turn').innerText = 'Turno de O';
    }
    else {
        document.getElementById('turn').innerText = 'Turno de X';
    }

    // Mostrar las jugadas realizadas por los jugadores en la interfaz
    if (p1MarkedPosition != ''){
        document.getElementById(`${p1MarkedPosition}`).innerText='X';
        document.getElementById(`${p1MarkedPosition}`).disabled = true;
    }
    if (p2MarkedPosition != ''){
        document.getElementById(`${p2MarkedPosition}`).innerText='O';
        document.getElementById(`${p2MarkedPosition}`).disabled = true;
    }

    // Habilitar o deshabilitar los botones según el turno del jugador actual
    if (document.getElementById('value').innerText != document.getElementById('turn').innerText.split(' ').slice(-1)){
        changeButtonState(true);
    }
    else{
        changeButtonState(false);
    }

    // Verificar si hay un ganador o empate
    check(userName, foundObj.sum);
})

// Función para cambiar el estado de los botones
const changeButtonState = (_disabled) => {
    document.getElementById('btn1').innerText == '' ? document.getElementById('btn1').disabled = _disabled : document.getElementById('btn1').disabled = true;
    document.getElementById('btn2').innerText == '' ? document.getElementById('btn2').disabled = _disabled : document.getElementById('btn2').disabled = true;
    document.getElementById('btn3').innerText == '' ? document.getElementById('btn3').disabled = _disabled : document.getElementById('btn3').disabled = true;
    document.getElementById('btn4').innerText == '' ? document.getElementById('btn4').disabled = _disabled : document.getElementById('btn4').disabled = true;
    document.getElementById('btn5').innerText == '' ? document.getElementById('btn5').disabled = _disabled : document.getElementById('btn5').disabled = true;
    document.getElementById('btn6').innerText == '' ? document.getElementById('btn6').disabled = _disabled : document.getElementById('btn6').disabled = true;
    document.getElementById('btn7').innerText == '' ? document.getElementById('btn7').disabled = _disabled : document.getElementById('btn7').disabled = true;
    document.getElementById('btn8').innerText == '' ? document.getElementById('btn8').disabled = _disabled : document.getElementById('btn8').disabled = true;
    document.getElementById('btn9').innerText == '' ? document.getElementById('btn9').disabled = _disabled : document.getElementById('btn9').disabled = true;
}

// Función para verificar si hay un ganador o empate
const check = (name, sum) => {
    let btn1 = document.getElementById('btn1').innerText;
    let btn2 = document.getElementById('btn2').innerText;
    let btn3 = document.getElementById('btn3').innerText;
    let btn4 = document.getElementById('btn4').innerText;
    let btn5 = document.getElementById('btn5').innerText;
    let btn6 = document.getElementById('btn6').innerText;
    let btn7 = document.getElementById('btn7').innerText;
    let btn8 = document.getElementById('btn8').innerText;
    let btn9 = document.getElementById('btn9').innerText;

    // Verificar si hay un ganador en cualquier fila, columna o diagonal
    if ((btn1 != '' && btn1 == btn2 && btn2 == btn3) || // row 1
        (btn4 != '' && btn4 == btn5 && btn5 == btn6) || // row 2
        (btn7 != '' && btn7 == btn8 && btn8 == btn9) || // row 3
        (btn1 != '' && btn1 == btn4 && btn4 == btn7) || // col 1
        (btn2 != '' && btn2 == btn5 && btn5 == btn8) || // col 2
        (btn3 != '' && btn3 == btn6 && btn6 == btn9) || // col 3
        (btn1 != '' && btn1 == btn5 && btn5 == btn9) || // diagonal \
        (btn3 != '' && btn3 == btn5 && btn5 == btn7)){  // diagonal /
        
        // Emitir un evento 'gameOver' con el nombre del jugador al servidor
        socket.emit('gameOver', {name: name});
        
        let winner;
        // Determinar el ganador y mostrarlo en la interfaz
        if (sum % 2 == 0) {
            let userValue = document.getElementById('value').innerText;
            if (userValue == 'X'){
                winner = document.getElementById('user').innerText;
                showContentById('userWinnerCrown');
            }
            else{
                winner = document.getElementById('oppUser').innerText;
                showContentById('oppUserWinnerCrown');
            }
            document.getElementById('turn').innerText = `Ganó ${winner} 🎉🎊`;
        }
        else{
            let userValue = document.getElementById('value').innerText;
            if (userValue == 'O'){
                winner = document.getElementById('user').innerText;
                showContentById('userWinnerCrown');
            }
            else{
                winner = document.getElementById('oppUser').innerText;
                showContentById('oppUserWinnerCrown');
            }
        }
        document.getElementById('turn').innerText = `Ganó ${winner} 🎉🎊`;
        showContentById('refresh');
        changeButtonState(true);
    }
    else if (sum === 10){
        // Emitir un evento 'gameOver' con el nombre del jugador al servidor
        socket.emit('gameOver', {name: name});
        
        // Mostrar el mensaje de empate en la interfaz
        document.getElementById('turn').innerText = 'Empate 🤷‍♂️';
        showContentById('refresh');
        changeButtonState(true);
    }
}

// Manejar el evento 'nextPair' del servidor
socket.on('nextPair', (e) => {

    // Emitir un evento 'nextPair' al servidor
    socket.emit('nextPair', e);
})

// Función para refrescar la página
const refreshPage = () => {
    location.reload();
}

// Función para mostrar un elemento por su ID
const showContentById = (tagId) => {
    document.getElementById(`${tagId}`).classList.remove("hide");
    document.getElementById(`${tagId}`).classList.add("show");
}

// Función para ocultar un elemento por su ID
const hideContentById = (tagId) => {
    document.getElementById(`${tagId}`).classList.remove("show");
    document.getElementById(`${tagId}`).classList.add("hide");
}
