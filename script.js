document.querySelector('#change-theme').addEventListener('click', toggleTheme);
const root = document.querySelector(':root');
setTheme(getTheme() === 'dark');

const addInput = document.querySelector('#add-player-row input');
const players = new Array();
let lastID = 0;
let isAdding = false;

document.querySelector('#add-player-row button').addEventListener('click', handleEditRequest);
addInput.addEventListener('keydown', handleEditRequest);

function handleEditRequest(event){
    if(event instanceof KeyboardEvent) if(event.key !== 'Enter') return;
    if(!isAdding) {
        addInput.style = 'display:block;';
    }
    else {
        if(validateName(addInput.value)){
            addInput.style = 'display:none;';
            addPlayer(addInput.value);
            addInput.value = '';
        } else {
            showToast('Nome inválido!');
            return;
        }
    }

    isAdding = !isAdding;
}

function validateName(name){
    return name.trim().length > 0;
}

function addPlayer(name){
    if(players.some(player => player.name.toLowerCase() === name.toLowerCase())){
        return showToast('Jogador já adicionado!');
    }

    const id = generateID();
 
    players.push({
        id,
        name,
        throws:[]
    });

    //updateView();
}

function updateView(){
    throw new Error('NOT_IMPLEMENTED_FUNCTION');
}

function generateID(){
    return 'id-' + lastID++;
}

/* function generateID(){
    const newID = 'id-' + Math.random();

    if(ids.some(id => id === newID)) return generateID();
    return newID;
} */

function showToast(message){
    alert(message);
}


//#region Manipulação de tema
function getTheme(){
    const theme = window.localStorage.getItem('theme');

    if(theme !== null) return theme;
    return 'light';
}

function setTheme(dark){
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    root.style = `color-scheme:${dark ? 'dark' : 'light'}`;
}

function toggleTheme(){
    const theme = getTheme();
    setTheme(theme !== 'dark');
}
//#endregion