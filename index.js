import LightSource from './lightSource.js';
import Walls from './walls.js';

const world = document.getElementById('world');
const world3d = document.getElementById('world3d');
const ctx = world.getContext('2d');
const ctx3d = world3d.getContext('2d');

const bgTopImg = new Image();
bgTopImg.src = './stars.jpg'

ctx.canvas.width = window.innerWidth / 2.2;
ctx3d.canvas.width = window.innerWidth / 2.2;
ctx.canvas.height = window.innerHeight / 1.2;
ctx3d.canvas.height = window.innerHeight / 1.2;

let fpsInterval, now, then, elapsed, requestID;

const fps = 75;

let walls;
let lightSource;

let bgTopX = 0;

const gameLoop = () => {
    requestID = requestAnimationFrame(gameLoop);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        ctx.clearRect(0, 0, world.width, world.height);
        ctx3d.clearRect(0, 0, world3d.width, world3d.height);
        walls.draw();

        bgTopImg.width = world3d.width * 4;

        if (lightSource.moveDirLR === 'left') {
            bgTopX += (bgTopImg.width / 360) * lightSource.rotationAmt;
        } else if (lightSource.moveDirLR === 'right') {
            bgTopX -= (bgTopImg.width / 360) * lightSource.rotationAmt;
        }
        
        if (bgTopX > 0) {
            bgTopX = -(bgTopImg.width);
        } else if (bgTopX < -(bgTopImg.width)) {
            bgTopX = 0;
        }

        ctx3d.drawImage(bgTopImg, bgTopX, 0, bgTopImg.width, world3d.height * 0.4);
        ctx3d.drawImage(bgTopImg, bgTopX + bgTopImg.width, 0, bgTopImg.width, world3d.height * 0.4);
        ctx3d.fillStyle = `rgba(0,0,0,0.6)`;
        ctx3d.fillRect(0, 0, world3d.width, world3d.height * 0.4);

        lightSource.draw(); 
        lightSource.rotate();
        lightSource.move();

        ctx3d.beginPath();
        ctx3d.strokeStyle = `rgba(255,0,0,1)`;
        ctx3d.ellipse(world3d.width/2, world3d.height/2, 3, 3, 2 * Math.PI, 0, 2 * Math.PI);
        ctx3d.stroke();
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
        document.body.style.cursor = 'none';
        walls = new Walls(world, 10);
    } else {
        ctx.canvas.width = window.innerWidth / 2.2;
        ctx3d.canvas.width = window.innerWidth / 2.2;
        ctx.canvas.height = window.innerHeight / 1.2;
        ctx3d.canvas.height = window.innerHeight / 1.2;
        document.body.style.cursor = 'default';
        walls = new Walls(world, 5);
    }

    const allWalls = walls.build();
    lightSource = new LightSource(world, world3d, allWalls);
    lightSource.setAngles();

    gameLoop();
}

window.onload = () => {
    beginLoop(fps);
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
        } else {
            world.style.display = 'none';
        }
        beginLoop(fps);
    }
})