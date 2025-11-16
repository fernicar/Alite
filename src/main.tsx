import './style.css'
import { Alite } from './de/phbouillon/android/games/alite/Alite';

const game = new Alite();

function gameLoop() {
  game.update();
  game.render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
