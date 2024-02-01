console.log( "ready!" );

const socket = io();

var userName;

const findPlayer = () => {
    userName = document.getElementById("name").value;

    document.getElementById("user").innerText = userName;

    if(userName === null || userName === ''){
        alert("Se necesita un nombre para iniciar la partida.");
    }
    else{
        socket.emit('find', {name:userName});

        document.getElementById('loading').classList.remove("hide");
        document.getElementById('loading').classList.add("show");

        document.getElementById('find').disabled=true;
    }
}