document.querySelector('#change-theme').addEventListener('click', toggleTheme);
const root = document.querySelector(':root');
setTheme(getTheme() === 'dark');
const history = getHistory();

const addInput = document.querySelector('#add-player-row input');
const players = new Array();
let lastID = 0;
let isAdding = false;
setPlayers();

document.querySelector('#unshift-btn').addEventListener('click', unshiftPlayers); //evento ao clicar para colocar o último jogador em primeiro
document.querySelector('#add-player-row button:last-child').addEventListener('click', handleEditRequest); //evento ao clicar para adicionar um jogador
document.querySelector('#add-player-row button').addEventListener('click', cancelAddPlayer); //evento ao cancelar a adição
addInput.addEventListener('keydown', handleEditRequest);

function handleEditRequest(event) {
    if (event instanceof KeyboardEvent) if (event.key !== 'Enter') return;
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
    if (players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
        return showToast('Jogador já adicionado!');
    }

    const id = generateID();
    players.push({
        id,
        name,
        throws: []
    });

    updateView('add');
}

function removePlayer(event) {
    const id = event.target.dataset['id']
    const i = players.findIndex(player => player.id === id);

    players.splice(i, 1);
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
        const player = players[0];
        updateView('remove', player.id);

        for (let i = 0; i < 3; i++) {
            const cell = setCell(i, player);
            if (players.length === 1) document.querySelector('#gameboard').insertBefore(cell, document.querySelector('#add-player-row'));
            else {
                const nextPlayerId = players[1].id;
                document.querySelector('#gameboard').insertBefore(cell, document.querySelector(`#gameboard > [data-id="${nextPlayerId}"]`));
            }
        }


    }
}

function setCell(i, player) {
    const div = document.createElement('div');
    if (i === 0) {
        div.innerHTML = player.name + `<button data-id="${player.id}" type="button">R</button>`;
        div.querySelector(`button[data-id="${player.id}"]`).addEventListener('click', removePlayer);
    }
    else if (i === 1) {
        for(let i = 0; i < 3; i++){
            const button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.classList.add('score-button');
            button.innerText = 'X';

            div.appendChild(button);
        }
        div.classList.add('score-container');
    }
    else if (i === 2) div.innerText = player.throws.reduce((acc, crr) => acc + crr, 0);

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

document.querySelector('#salvar').addEventListener('click', saveMatch);//FIXME: remover

function saveMatch() {
    history.push({
        players,//vai salvar o id também, mas que não será utilizado
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
    players.unshift(players.pop());
    updateView('unshift');
}

function generateID() {
    return String(lastID++);
    return 'id-' + lastID++;
}

/* function generateID(){
    const newID = 'id-' + Math.random();

    if(ids.some(id => id === newID)) return generateID();
    return newID;
} */

function showToast(message) {
    alert(message);
}


//#region Manipulação de tema
function getTheme() {
    const theme = window.localStorage.getItem('theme');

    if (theme !== null) return theme;
    return 'light';
}

function setTheme(dark) {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    root.style = `color-scheme:${dark ? 'dark' : 'light'}`;
}

function toggleTheme() {
    const theme = getTheme();
    setTheme(theme !== 'dark');
}
//#endregion