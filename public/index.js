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

let fullscreen = false;

const fps = 75;

let walls;
let lightSource;
let sprinting = false;

let bgTopX = 0;
let bgTopDividend = 180;

const gameLoop = () => {
    requestID = requestAnimationFrame(gameLoop);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        ctx.clearRect(0, 0, world.width, world.height);
        ctx3d.clearRect(0, 0, world3d.width, world3d.height);

        walls.draw();

        //multiply bg img width by 4 so when you rotate 90deg, you're 1/4th through the img
        bgTopImg.width = world3d.width * 2;

        //move the bg img when rotating with keys
        if (lightSource.moveDirLR === 'left') {
            bgTopX += (bgTopImg.width / bgTopDividend) * lightSource.rotationAmt;
        } else if (lightSource.moveDirLR === 'right') {
            bgTopX -= (bgTopImg.width / bgTopDividend) * lightSource.rotationAmt;
        }
        
        //reset bg img position if ends of img are in view
        if (bgTopX > 0) {
            bgTopX = -(bgTopImg.width);
        } else if (bgTopX < -(bgTopImg.width)) {
            bgTopX = 0;
        }

        ctx3d.drawImage(bgTopImg, bgTopX, 0, bgTopImg.width, world3d.height * 0.4);
        ctx3d.drawImage(bgTopImg, bgTopX + bgTopImg.width, 0, bgTopImg.width, world3d.height * 0.4);
        ctx3d.fillStyle = `rgba(0,0,0,0.7)`;
        ctx3d.fillRect(0, 0, world3d.width, world3d.height * 0.4);

        lightSource.draw(); 
        lightSource.rotate();
        lightSource.move();

        ctx3d.strokeStyle = `rgba(255,0,0,1)`;
        ctx3d.lineWidth = 2;
        ctx3d.beginPath();
        ctx3d.ellipse(world3d.width/2, world3d.height/2, 3, 3, 0, 0, 2 * Math.PI);
        ctx3d.stroke();
    }
}

const beginLoop = (fps) => {
    fpsInterval = 1000 / fps;
    then = Date.now();

    //show or hide canvas with rays based on fullscreen variable
    //lock & hide or unlock & show pointer based on fullscreen variable
    //set new wall layout
    if (fullscreen) {
        world3d.requestPointerLock = world3d.requestPointerLock || world3d.mozRequestPointerLock || world3d.webkitRequestPointerLock;
        world3d.requestPointerLock();
        ctx.canvas.width = window.innerWidth;
        ctx3d.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ctx3d.canvas.height = window.innerHeight;
        walls = new Walls(world, 10);
    } else {
        document.exitPointerLock  = document.exitPointerLock || document.mozExitPointerLock  || document.webkitExitPointerLock;
        document.exitPointerLock();
        ctx.canvas.width = window.innerWidth / 2.2;
        ctx3d.canvas.width = window.innerWidth / 2.2;
        ctx.canvas.height = window.innerHeight / 1.2;
        ctx3d.canvas.height = window.innerHeight / 1.2;
        walls = new Walls(world, 5);
    }

    //Get all wall points and corner points
    const allWalls = walls.build();
    lightSource = new LightSource(world, world3d, allWalls[0], allWalls[1]);
    lightSource.setAngles();

    gameLoop();
}

window.onload = () => {
    beginLoop(fps);
}

document.addEventListener('mousemove', (e) => {
    //Set player angle and bg img position
    if (fullscreen) {
        lightSource.setMouseRotation(e.movementX / 20);
        bgTopX -= (bgTopImg.width / bgTopDividend) * e.movementX / 20;
    }

})

document.addEventListener('keydown', (e) => {
    //Set FOV
    if (e.code === 'ArrowUp') {
        lightSource.setFov('up');
    } else if (e.code === 'ArrowDown') {
        lightSource.setFov('down');
    }

    //set ray density
    if (e.code === 'KeyQ') {
        lightSource.setRayDensity('q');
    } else if (e.code === 'KeyE') {
        lightSource.setRayDensity('e');
    }

    //Sest move forewards and backwards
    if (e.code === 'KeyW') {
        lightSource.setMoveDir('forwards');
    }  else if (e.code === 'KeyS') {
        lightSource.setMoveDir('backwards');
    }

    if (fullscreen) {
        //Set strafe left and right
        if (e.code === 'KeyA') {
            lightSource.setStrafeDir('left');
        } else if (e.code === 'KeyD') {
            lightSource.setStrafeDir('right');
        }
    } else {
        //Set rotate player
        if (e.code === 'KeyA') {
            lightSource.setRotation('left');
        } else if (e.code === 'KeyD') {
            lightSource.setRotation('right');
        }
    }

    if (e.code === 'ShiftLeft' && !sprinting) {
        sprinting = true;
        lightSource.moveAmt = lightSource.moveAmtTop * 2;
    }
})

document.addEventListener('keyup', (e) => {
    //Set movement variables to null when key released
    if (fullscreen) {
        if ((e.code === 'KeyA') || (e.code === 'KeyD')) {
            lightSource.setStrafeDir(null);
        }
    } else {
        if ((e.code === 'KeyA') || (e.code === 'KeyD')) {
            lightSource.setRotation(null);
        }
    } 

    if ((e.code === 'KeyW') || (e.code === 'KeyS')) {
        lightSource.setMoveDir(null);
    } 

    //Reset everything
    if (e.code === 'Space') {
        if (requestID) {
            cancelAnimationFrame(requestID);
        }
        beginLoop(60);
    }

    //Toggle fullscreen
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
        fullscreen = !fullscreen;
        lightSource.setFullscreen(fullscreen);
        beginLoop(fps);
    }

    if (e.code === 'ShiftLeft') {
        sprinting = false;
        if (lightSource.moveDirFB) {
            lightSource.moveAmt = lightSource.moveAmtTop;
        } else {
            lightSource.moveAmt = lightSource.moveAmtStart;
        }
    }
})