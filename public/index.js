import LightSource from './lightSource.js';
import Walls from './walls.js';

const world = document.getElementById('world');
const world3d = document.getElementById('world3d');

let fpsInterval, now, then, elapsed, requestID;

let walls;
let lightSource;

const gameLoop = () => {
    requestID = requestAnimationFrame(gameLoop);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        walls.clear();
        walls.draw();

        lightSource.draw();
        lightSource.rotate();
        lightSource.move();
    }
}
const beginLoop = (fps) => {
    fpsInterval = 1000 / fps;
    then = Date.now();

    walls = new Walls(world);
    const allWalls = walls.build();
    lightSource = new LightSource(world, world3d, allWalls);

    gameLoop();
}

document.addEventListener('click', () => {
    if (requestID) {
        cancelAnimationFrame(requestID);
    }
    beginLoop(60);
})

document.addEventListener('mousemove', (e) => {
    // const playerX = e.clientX - (document.querySelector('#world').getBoundingClientRect().left - document.querySelector('body').getBoundingClientRect().left);
    // const playerY = e.clientY - (document.querySelector('#world').getBoundingClientRect().top - document.querySelector('body').getBoundingClientRect().top);
    // lightSource.setPlayerPos(playerX, playerY);
})

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') {
        lightSource.setRayIncrement('up');
    } else if (e.code === 'ArrowDown') {
        lightSource.setRayIncrement('down');
    }

    if (e.code === 'KeyW') {
        lightSource.setMoveDir('forwards');
    }  else if (e.code === 'KeyS') {
        lightSource.setMoveDir('backwards');
    }

    if (e.code === 'KeyA') {
        lightSource.setRotation('left');
    } else if (e.code === 'KeyD') {
        lightSource.setRotation('right');
    }
})

document.addEventListener('keyup', (e) => {
    if ((e.code === 'KeyA') || (e.code === 'KeyD')) {
        lightSource.setRotation(null);
    } 

    if ((e.code === 'KeyW') || (e.code === 'KeyS')) {
        lightSource.setMoveDir(null);
    } 
})