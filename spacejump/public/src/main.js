import Game from './game';

const playButton = document.getElementById('playButton');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game');

playButton.addEventListener('click', () => {
  menu.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  new Game(gameContainer);
});
