document.querySelector('#change-theme').addEventListener('click', toggleTheme);
const root = document.querySelector(':root');
setTheme(getTheme() === 'dark');

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
