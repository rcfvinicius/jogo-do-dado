document.querySelector('#change-theme').addEventListener('click', toggleTheme);
document.querySelector('#toggle-sidebar-btn').addEventListener('click', toggleSidebar);
const root = document.querySelector(':root');
setTheme(getTheme() === 'dark');
/** A lista nunca é reordenada. A ordem é sempre a mesma (da partida mais antiga para a mais recente) */
const history = getHistory();
const userWins = getUserWinHistory();
const addInput = document.querySelector('#add-player-row input');
let players = new Array();
let lastID = 0;
let isAdding = false;
let isModalOpen = false;
let currentFilter;
setPlayers();
loadSidebar();

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
        const playerWins = userWins[player.name] ? userWins[player.name] : 0;
        div.innerHTML = `<span>${player.name}<span>${playerWins ? ' <span class=\"player-wins\">(' + playerWins + ' derrotas)</span>' : ''}</span></span><button class="remove-button" data-id="${player.id}" type="button"></button>`;
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
    let history = localStorage.getItem('history');

    if (history === null) return new Array();

    history = JSON.parse(history);
    if (history.every((item) => !item.gameNumber)) {
        history.forEach((item, i) => {
            item.gameNumber = i + 1;
        });
    }
    return history;
}

function saveMatch() {
    const gameNumber = history.length + 1;
    history.push({
        players, //vai salvar o id também, mas não será utilizado
        date: getDate(),
        gameNumber
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
    const toastArea = document.querySelector('#toast-area');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    const text = document.createElement('h3');
    text.innerText = message;
    toast.appendChild(text);

    const toastElements = toastArea.querySelectorAll('.toast');
    if (toastElements.length > 0) toastArea.insertBefore(toast, toastElements[0]);
    else toastArea.appendChild(toast);

    window.setTimeout(toast.remove.bind(toast), 5000);
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
        if (player.total === 3) player.total = 18;
        else if (player.total === 18) player.total = 3;

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

function getUserWinHistory() {
    /** @type {Map<string, number>} */
    const winHistoryMap = new Map();
    history.forEach((match) => {
        let losingPlayers = [];
        match.players.forEach((player) => {
            if (losingPlayers.length === 0) return losingPlayers = [player]; // adicionar o primeiro caso e ir pro próximo loop.

            const winningPlayer = losingPlayers.at(0) // nunca winningPlayer e player vão ser o mesmo, então é seguro.

            if (player.total > winningPlayer.total) return;
            if (player.total === winningPlayer.total) return losingPlayers.push(player); // caso total for igual ao do jogador vencedor, contar os dois (ou mais já que é push).
            losingPlayers = [player]; // caso total for maior que o vencedor atual, substitua o vencedor.
        });

        if (losingPlayers.length === match.players.length) return; // empate total, não contar jogadores vencedores.

        losingPlayers.forEach((winningPlayer) => {
            winHistoryMap.set(winningPlayer.name, winHistoryMap.get(winningPlayer.name) + 1 || 1);
        });
    });
    return Object.fromEntries(winHistoryMap);
}

// #region Sidebar

function loadSidebar(items) {
    const ul = document.querySelector('.rcf-sidebar-list');
    ul.scrollTo(0, 0);
    ul.innerHTML = '';

    if (!history.length) {
        document.querySelectorAll('.rcf-sidebar-filters .filter-btn').forEach((e) => e.setAttribute('disabled', ''));
        const li = document.createElement('li');
        li.classList.add('no-items');

        const img = document.createElement('img');
        img.src = '/images/circle-info-solid-full.svg';

        const h2 = document.createElement('h2');
        h2.textContent = 'Nenhuma partida salva'
        li.appendChild(img);
        li.appendChild(h2);
        ul.appendChild(li);
        return;
    }
    if (items?.length === 0) {
        const li = document.createElement('li');
        li.classList.add('no-items');

        const img = document.createElement('img');
        img.src = '/images/circle-info-solid-full.svg';

        const h2 = document.createElement('h2');
        h2.textContent = 'Nenhum item para o filtro selecionado'
        li.appendChild(img);
        li.appendChild(h2);
        ul.appendChild(li);
        return;
    }

    if (!items) items = history;

    let lastGroup = null;

    items.forEach((current, i) => {
        const li = document.createElement('li');
        const animationDelay = (items.length - 1 - i) * 3 * (i > 20 ? 0 : 1) + '0ms';
        li.style.animationDelay = animationDelay;
        if (i > 300) li.classList.add('remove-li-animation');
        const loser = getLoser(current);
        if (i === 0) lastGroup = loser?.name;
        if (currentFilter && (lastGroup !== loser.name)) {
            const divider = document.createElement('li');
            divider.style.animationDelay = animationDelay;
            divider.innerHTML = `<h2>${lastGroup.toUpperCase()}</h2> ${defeatCounter(lastGroup, items)}`;
            ul.prepend(divider);
            lastGroup = loser.name;
        }

        li.innerHTML = `
            <p>
                Jogo #${current.gameNumber}<br />
                Perdedor: <b>${loser?.name?.toUpperCase() ?? 'Empate'}</b><br />
                Data: ${current.date}
            </p>
        `;//Pontuação: ${loser?.total ?? '0'}<br />

        li.addEventListener('click', () => onMatchSelected(current.gameNumber));
        ul.prepend(li);

        if (currentFilter && i === items.length - 1) {
            const divider = document.createElement('li');
            divider.style.animationDelay = animationDelay;
            divider.innerHTML = `<h2>${lastGroup.toUpperCase()}</h2> ${defeatCounter(lastGroup, items)}`;
            ul.prepend(divider);
        }
    });
}

function onMatchSelected(gameNumber) {
    const modal = document.querySelector('.modal');
    modal.classList.add('open');
    modal.innerHTML = `
        <div>
            <span>Jogadores</span>
        </div>
        <div>Pontuação</div>
        <div>Total</div>
    `;
    if (!isModalOpen) {
        setTimeout(() => {
            isModalOpen = true;
        }, 500);
    }

    const match = history.find(x => x.gameNumber === gameNumber);
    const loserName = getLoser(match)?.name;

    match.players.forEach((player) => {
        for (let i = 0; i < 3; i++) {
            const div = document.createElement('div');
            if (i === 0) {
                div.innerHTML = `<span>${player.name}</span>`;
                div.classList.add('player-name-container');
            } else if (i === 1) {
                for (let j = 0; j < 3; j++) {
                    const button = document.createElement('button');
                    button.setAttribute('type', 'button');
                    button.classList.add('score-button');
                    button.innerHTML = `<img src="./images/dado-${player.throws[j]}.svg"/>`;
                    div.appendChild(button);
                }
                div.classList.add('score-container');
            } else if (i === 2) {
                div.innerText = player.throws.reduce((acc, crr) => acc + crr, 0);
                div.classList.add('total-container');
            }

            if (loserName === player.name) {
                div.classList.add('blink-line');
                if (isModalOpen) {
                    div.style.animationDelay = '0s';
                }
            }
            modal.appendChild(div);
        }
    });
}

function defeatCounter(name, items) {
    let counter = 0;
    items.forEach((item) => {
        const loser = getLoser(item);
        if (loser?.name === name) counter++;
    });

    return counter;
}

function onSelectFilter(filter = null) {
    document.querySelectorAll('.rcf-sidebar-filters .filter-btn').forEach((e) => e.classList.remove('filter-active'));
    if (filter === currentFilter) {
        currentFilter = null;
        loadSidebar();
        return;
    }
    document.querySelector(`.rcf-sidebar-filters li:nth-child(${filter}) .filter-btn`).classList.add('filter-active');
    currentFilter = filter;

    let items = new Array();
    const defeats = new Array();

    history.forEach((current) => {
        const loser = getLoser(current, filter === 3);
        if (!loser) return;

        if (!defeats.some(x => x.name === loser.name)) return defeats.push({ name: loser.name, defeats: 1 });
        defeats.find(x => x.name === loser.name).defeats += 1;
    });
    defeats.sort((a, b) => {
        if (filter === 1) return b.defeats - a.defeats;
        if (filter === 2) return a.defeats - b.defeats;
        return 0;
    });

    for (let i = defeats.length - 1; i >= 0; i--) {
        history.forEach((current) => {
            const loser = getLoser(current, filter === 3);
            if (loser?.name === defeats[i].name) {
                items.push(current);
            }
        });
    }

    loadSidebar(items);
}

function getLoser(listItem, only666 = false) {
    let min = 20;
    let loser;

    for (const player of listItem.players) {
        if (only666) {
            if (player.total < min && player.total === 3) {
                min = player.total;
                loser = player;
            }
            continue;
        }
        if (player.total < min) {
            min = player.total;
            loser = player;
        }
    }

    const losers = listItem.players.filter(p => {
        return p.throws.reduce((acc, crr) => acc + crr, 0) === min;
    });

    if (losers.length > 1) return null;
    return loser;
}

function toggleSidebar(action = 'close') {
    if (action === 'open') {
        document.querySelector('.rcf-sidebar ul').scrollTop = 0;
        document.querySelector('.rcf-sidebar-backdrop').style.display = 'block';
        document.querySelector('.rcf-sidebar').classList.add('rcf-sidebar-open');
        document.querySelector(':root').classList.add('rcf-overflow-hidden');
        document.querySelector('.rcf-sidebar-list').scrollTo(0, 0);
    }
    if (action === 'close') {
        document.querySelector('.rcf-sidebar-backdrop').style.display = 'none';
        document.querySelector('.rcf-sidebar').classList.remove('rcf-sidebar-open');
        document.querySelector(':root').classList.remove('rcf-overflow-hidden');
        document.querySelector('.modal').classList.remove('open');
        setTimeout(() => {
            isModalOpen = false;
        }, 500);
    }
}

//#endregion

window.addEventListener('resize', () => setSelectScorePosition());

document.querySelector('#version').innerText = 'v' + root.dataset.version;

//#region Manipulação de tema
function getTheme() {
    const theme = window.localStorage.getItem('theme');

    if (theme !== null) return theme;
    return 'light';
}

function setTheme(dark) {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    root.style = `color-scheme:${dark ? 'dark' : 'light'}`;

    if (dark) {
        document.querySelector('#change-theme img').src = './images/sun-solid-full.svg';
        document.querySelector('#toggle-sidebar-btn img').src = './images/menu-icon-white.svg';
    }
    else {
        document.querySelector('#change-theme img').src = './images/moon-solid-full.svg';
        document.querySelector('#toggle-sidebar-btn img').src = './images/menu-icon.svg';
    }
}

function toggleTheme() {
    const theme = getTheme();
    setTheme(theme !== 'dark');
}
//#endregion