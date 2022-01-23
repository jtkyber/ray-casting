import LightSource from './lightSource.js';
import Walls from './walls.js';

const world = document.getElementById('world');
const world3d = document.getElementById('world3d');
const ctx = world.getContext('2d');
const ctx3d = world3d.getContext('2d');

ctx.canvas.width = window.innerWidth / 2.2;
ctx3d.canvas.width = window.innerWidth / 2.2;
ctx.canvas.height = window.innerHeight / 1.2;
ctx3d.canvas.height = window.innerHeight / 1.2;

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

    if (window.getComputedStyle(world).display === 'none') {
        ctx.canvas.width = window.innerWidth;
        ctx3d.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ctx3d.canvas.height = window.innerHeight;
        walls = new Walls(world, 10);
    } else {
        ctx.canvas.width = window.innerWidth / 2.2;
        ctx3d.canvas.width = window.innerWidth / 2.2;
        ctx.canvas.height = window.innerHeight / 1.2;
        ctx3d.canvas.height = window.innerHeight / 1.2;
        walls = new Walls(world, 4);
    }

    const allWalls = walls.build();
    lightSource = new LightSource(world, world3d, allWalls);
    lightSource.setAngles();

    gameLoop();
}

document.addEventListener('mousemove', (e) => {
    // const playerX = e.clientX - (document.querySelector('#world').getBoundingClientRect().left - document.querySelector('body').getBoundingClientRect().left);
    // const playerY = e.clientY - (document.querySelector('#world').getBoundingClientRect().top - document.querySelector('body').getBoundingClientRect().top);
    // lightSource.setPlayerPos(playerX, playerY);
})

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') {
        lightSource.setFov('up');
    } else if (e.code === 'ArrowDown') {
        lightSource.setFov('down');
    }

    if (e.code === 'KeyQ') {
        lightSource.setRayDensity('q');
    } else if (e.code === 'KeyE') {
        lightSource.setRayDensity('e');
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

    if (e.code === 'Space') {
        if (requestID) {
            cancelAnimationFrame(requestID);
        }
        beginLoop(60);
    }

    if (e.code === 'Enter') {
        e.preventDefault();
        if (requestID) {
            cancelAnimationFrame(requestID);
        }
        if (window.getComputedStyle(world).display === 'none') {
            world.style.display = 'block';
            // ctx.canvas.width = window.innerWidth / 2.2;
            // ctx3d.canvas.width = window.innerWidth / 2.2;
            // ctx.canvas.height = window.innerHeight / 1.2;
            // ctx3d.canvas.height = window.innerHeight / 1.2;
        } else {
            world.style.display = 'none';
            // ctx.canvas.width = window.innerWidth;
            // ctx3d.canvas.width = window.innerWidth;
            // ctx.canvas.height = window.innerHeight;
            // ctx3d.canvas.height = window.innerHeight;
        }
        beginLoop(60);
    }
})