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

        showContentById('loading')

        document.getElementById('find').disabled=true;
    }
}

socket.on('find', (e) => {
    let playersArray = e.players

    console.log(playersArray);

    showContentById('userCont');
    showContentById('oppUserCont');
    showContentById('valueCont');
    showContentById('oppnValueCont');
    showContentById('container');
    showContentById('turn');

    hideContentById('loading');
    hideContentById('name');
    hideContentById('find');
    hideContentById('nameTextHint');

    document.getElementById('turn').innerText = 'Turno de X';

    let oppName
    let value

    const foundObj = playersArray.find(obj => obj.p1.name === `${userName}` || obj.p2.name === `${userName}`)

    foundObj.p1.name === userName ? oppName = foundObj.p2.name : oppName = foundObj.p1.name;
    foundObj.p2.name === userName ? value = foundObj.p2.value : value = foundObj.p1.value;

    document.getElementById('oppUser').innerText = oppName;
    document.getElementById('value').innerText = value;
    document.getElementById('oppnValue').innerText = value == 'O' ? 'X' : 'O';
    
    if (value != document.getElementById('turn').innerText.split(' ').slice(-1)){
        changeButtonState(true);
    }
    else{
        changeButtonState(false);
    }
})

document.querySelectorAll('.btn').forEach(e => {
    e.addEventListener('click', function() {
        let value = document.getElementById('value').innerText;
        e.innerText = value;

        socket.emit('playing', {value: value, id: e.id, name: userName});
    })
})

socket.on('playing', (e) => {

    const foundObj = (e.players).find(obj => obj.p1.name === `${userName}` || obj.p2.name === `${userName}`)

    p1MarkedPosition = foundObj.p1.markedPosition;
    p2MarkedPosition = foundObj.p2.markedPosition;

    if ((foundObj.sum) % 2 === 0){
        document.getElementById('turn').innerText = 'Turno de O';
    }
    else {
        document.getElementById('turn').innerText = 'Turno de X';
    }

    if (p1MarkedPosition != ''){
        document.getElementById(`${p1MarkedPosition}`).innerText='X';
        document.getElementById(`${p1MarkedPosition}`).disabled = true;
    }
    if (p2MarkedPosition != ''){
        document.getElementById(`${p2MarkedPosition}`).innerText='O';
        document.getElementById(`${p2MarkedPosition}`).disabled = true;
    }

    
    if (document.getElementById('value').innerText != document.getElementById('turn').innerText.split(' ').slice(-1)){
        changeButtonState(true);
    }
    else{
        changeButtonState(false);
    }

    check(userName, foundObj.sum);
})

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

    if ((btn1 != '' && btn1 == btn2 && btn2 == btn3) || // row 1
        (btn4 != '' && btn4 == btn5 && btn5 == btn6) || // row 2
        (btn7 != '' && btn7 == btn8 && btn8 == btn9) || // row 3
        (btn1 != '' && btn1 == btn4 && btn4 == btn7) || // col 1
        (btn2 != '' && btn2 == btn5 && btn5 == btn8) || // col 2
        (btn3 != '' && btn3 == btn6 && btn6 == btn9) || // col 3
        (btn1 != '' && btn1 == btn5 && btn5 == btn9) || // diagonal \
        (btn3 != '' && btn3 == btn5 && btn5 == btn7)){  // diagonal /
        
        socket.emit('gameOver', {name: name});
        
        let winner;
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
            alert(`Ganó ${winner} 🎉🎊`);
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
        alert(`Ganó ${winner} 🎉🎊`);
        showContentById('refresh');
        changeButtonState(true);
        document.getElementById('turn').innerText = 'Partida finalizada';
    }
    else if (sum === 10){
        alert('Empate 🤷‍♂️');
        showContentById('refresh');
        changeButtonState(true);
        document.getElementById('turn').innerText = 'Partida finalizada';
    }
}

const refreshPage = () => {
    location.reload();
}

const showContentById = (tagId) => {
    document.getElementById(`${tagId}`).classList.remove("hide");
    document.getElementById(`${tagId}`).classList.add("show");
}

const hideContentById = (tagId) => {
    document.getElementById(`${tagId}`).classList.remove("show");
    document.getElementById(`${tagId}`).classList.add("hide");
}