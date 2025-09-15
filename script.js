document.querySelector('#change-theme').addEventListener('click', toggleTheme);
const root = document.querySelector(':root');
setTheme(getTheme() === 'dark');
const history = getHistory();

const addInput = document.querySelector('#add-player-row input');
let players = new Array();
let lastID = 0;
let isAdding = false;
setPlayers();

document.querySelector('#unshift-btn').addEventListener('click', unshiftPlayers); //evento ao clicar para colocar o primeiro jogador em último.
document.querySelector('#add-player-row button:last-child').addEventListener('click', handleEditRequest); //evento ao clicar para adicionar um jogador
document.querySelector('#add-player-row button').addEventListener('click', cancelAddPlayer); //evento ao cancelar a adição
document.querySelector('#close-select-score').addEventListener('click', () => document.querySelector('#select-score').style = 'display:none');
addInput.addEventListener('keydown', handleEditRequest);

function handleEditRequest(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
    if (!isAdding) {
        addInput.style = 'display:block;';
        document.querySelector('#add-player-row button').style = 'display:block;';
    }
    else {
        if (validateName(addInput.value)) {
            addInput.style = 'display:none;';
            addPlayer(addInput.value);
            addInput.value = '';
            document.querySelector('#add-player-row button').style = 'display:none;';
        } else {
            return showToast('Nome inválido!');
        }
    }

    isAdding = !isAdding;
}

function cancelAddPlayer() {
    addInput.style = 'display:none;';
    addInput.value = '';
    document.querySelector('#add-player-row button').style = 'display:none;';
    isAdding = false;
}

function validateName(name) {
    return name.trim().length > 0;
}

function addPlayer(name) {
    name = name.toLowerCase();
    if (players.some(player => player.name === name)) {
        return showToast('Jogador já adicionado!');
    }

    const id = generateID();
    players.push({
        id,
        name,
        throws: [0, 0, 0]
    });

    updateView('add');
}

function removePlayer(event) {
    const id = event.target.dataset['id']
    const i = players.findIndex(player => player.id === id);

    players.splice(i, 1);
    checkThrows();
    updateView('remove', id);
}

function updateView(action, id = null) {
    if (action === 'add') { //adiciona o novo jogador ao final da lista
        const player = players.at(-1);
        for (let i = 0; i < 3; i++) {
            const cell = setCell(i, player);
            document.querySelector('#gameboard').insertBefore(cell, document.querySelector('#add-player-row'));
        }
        return;
    }

    if (action === 'remove') return document.querySelectorAll(`#gameboard > [data-id="${id}"]`).forEach(element => element.remove());

    if (action === 'unshift') {
        const player = players.at(-1);
        updateView('remove', player.id);

        for (let i = 0; i < 3; i++) {
            const cell = setCell(i, player);
            document.querySelector('#gameboard').insertBefore(cell, document.querySelector('#add-player-row'));
            checkThrows();
        }
        return;
    }

    if (action === 'score') {
        const score = players.find(p => p.id === id).throws.reduce((acc, crr) => acc + crr, 0);
        document.querySelectorAll(`#gameboard > [data-id="${id}"]`)[2].innerText = String(score);
    }
}


function setCell(i, player) {
    const div = document.createElement('div');
    if (i === 0) {
        div.innerHTML = `<span>${player.name}</span><button class="remove-button" data-id="${player.id}" type="button"></button>`;
        div.classList.add('player-name-container');
        div.querySelector(`button[data-id="${player.id}"]`).addEventListener('click', removePlayer);
    }
    else if (i === 1) {
        for (let j = 0; j < 3; j++) {
            const button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.classList.add('score-button');
            button.dataset['id'] = player.id;
            button.dataset['pos'] = j;
            // if (players[0].id !== player.id || j > 0) button.style = 'display:none';
            if (j > 0) button.style = 'display:none';
            if (player.throws[j] > 0) {
                button.innerHTML = `<img src="./images/dado-${player.throws[j]}.svg"/>`;
            }

            button.addEventListener('click', setSelectScorePosition);
            div.appendChild(button);
        }
        div.classList.add('score-container');
    }
    else if (i === 2) {
        div.innerText = player.throws.reduce((acc, crr) => acc + crr, 0);
        div.classList.add('total-container')
    }

    div.dataset['id'] = player.id;
    return div;
}

function setPlayers() {
    if (history.length === 0) return;
    const lastPlayers = history.at(-1).players;

    for (const p of lastPlayers) addPlayer(p.name);
}

function getHistory() {
    const history = localStorage.getItem('history');

    if (history === null) return new Array();
    return JSON.parse(history);
}

function showHistory() {
    if (history.length === 0) return;
    document.querySelector('#history')//TODO: exibir histórico
}

function saveMatch() {
    history.push({
        players, //vai salvar o id também, mas não será utilizado
        date: getDate()
    });

    localStorage.setItem('history', JSON.stringify(history));
}

function getDate() {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
}

function unshiftPlayers() {
    if (players.length === 0) return;
    //players.unshift(players.pop());
    const firstPlayer = players[0];
    players = players.filter(player => player.id !== firstPlayer.id);
    players.push(firstPlayer);

    updateView('unshift');
}

function generateID() {
    return String(lastID++);
}

/* function generateID(){
    const newID = 'id-' + Math.random();

    if(ids.some(id => id === newID)) return generateID();
    return newID;
} */

function showToast(message) {
    alert(message);
}

document.querySelectorAll('#dices > button').forEach(button => button.addEventListener('click', selectScore));

function selectScore(e) {
    const value = e.currentTarget.dataset['dice'];
    const playerId = lastSelectedScoreButton.dataset['id'];
    const img = lastSelectedScoreButton.querySelector('img');
    if (img) lastSelectedScoreButton.querySelector('img').src = `./images/dado-${value}.svg`;
    else lastSelectedScoreButton.innerHTML = `<img src="./images/dado-${value}.svg"/>`;

    document.getElementById('select-score').style = 'display:none;';
    players.find(p => p.id === playerId).throws[parseInt(lastSelectedScoreButton.dataset['pos'])] = parseInt(value);

    checkThrows();
    updateView('score', playerId);
}

function checkThrows() {
    //verifica se todos os jogadores jogaram a rodada.
    if (!players.some(p => p.throws[0] === 0)) document.querySelectorAll('.score-button[data-pos="1"]').forEach(element => element.style = '');
    if (!players.some(p => p.throws[1] === 0)) document.querySelectorAll('.score-button[data-pos="2"]').forEach(element => element.style = '');
    if (!players.some(p => p.throws[2] === 0)) finishGame();
}

function finishGame() {
    if (players.length === 0) return;
    let min = 19;
    players.forEach(player => {
        player.total = player.throws.reduce((acc, crr) => acc + crr, 0);
        if (player.total < min) min = player.total;
    });

    const losers = checkTie(min);
    showLosersBanner(losers);
    saveMatch();
}

function checkTie(min) {
    return players.filter(player => player.total === min);
}

function showLosersBanner(losers) {
    if (losers.length === 1) {
        document.querySelector('#game-over div div h1').innerText = losers[0].name;
        document.querySelector('#game-over').style = '';
        return;
    }

    //caso seja empate
    window.setTimeout(() => {
        document.querySelector('#game-over div div').style = `
            animation-name:none;
            opacity:1;
            transform:skew(0);
        `;

        document.querySelector('#game-over div div h1').innerText = 'empate';
        document.querySelector('#game-over div div h4').innerText = losers.map(player => player.name).join(', ');
    }, 300);

    document.querySelector('#game-over div').style = 'background-color:rgb(157 176 0);';
    document.querySelector('#game-over').style = '';
}

let lastSelectedScoreButton; //último botão da pontuação escolhido
function setSelectScorePosition(e) {
    if (e !== undefined) {
        lastSelectedScoreButton = e.target.parentNode.classList.contains('score-button') ? e.target.parentNode : e.target;
    }

    const top = lastSelectedScoreButton.offsetTop + 180 - 50; //header + margin
    const left = lastSelectedScoreButton.offsetLeft + lastSelectedScoreButton.offsetWidth + (document.body.scrollWidth - document.querySelector('#gameboard').offsetWidth) / 2;

    const selectScoreElement = document.getElementById('select-score');
    selectScoreElement.style.top = `${String(top)}px`;
    selectScoreElement.style.left = `${String(left)}px`;
    if (e !== undefined) {
        selectScoreElement.style.position = `absolute`;
        selectScoreElement.style.display = `block`;
    }
}

window.addEventListener('resize', () => setSelectScorePosition());



//#region Manipulação de tema
function getTheme() {
    const theme = window.localStorage.getItem('theme');

    if (theme !== null) return theme;
    return 'light';
}

function setTheme(dark) {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    root.style = `color-scheme:${dark ? 'dark' : 'light'}`;

    if (dark) document.querySelector('#change-theme img').src = './images/sun-solid-full.svg';
    else document.querySelector('#change-theme img').src = './images/moon-solid-full.svg';
}

function toggleTheme() {
    const theme = getTheme();
    setTheme(theme !== 'dark');
}
//#endregion