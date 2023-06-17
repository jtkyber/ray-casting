import LightSource from './lightSource.js';
import Walls from './walls.js';
import Build from './build.js';
import defaultWalls from './defaultWorld.json' assert { type: 'json'};

const qualitySlider = document.querySelector('#quality');
const qualityValue = document.querySelector('#qualityValue');
const fovSlider = document.querySelector('#fov');
const fovValue = document.querySelector('#fovValue');
const resetSettingsBtn = document.querySelector('#resetSettingsBtn');
const settingsBtn = document.querySelector('#settingsBtn');
const settings = document.querySelector('.settings');
const worldCreationContainer = document.querySelector('.worldCreationContainer');
const wallEditorBtn = document.querySelector('#wallEditorBtn');
const exitEditorBtn = document.querySelector('#exitEditorBtn');
const undoBtn = document.querySelector('#undoBtn');
const clearEditorBtn = document.querySelector('#clearEditorBtn');
const defaultMapBtn = document.querySelector('#defaultMapBtn');
const saveWallsBtn = document.querySelector('#saveWallsBtn');
const toggleFPSBtn = document.querySelector('#toggleFPSBtn');
const toggleCornersBtn = document.querySelector('#toggleCornersBtn');

const fpsCounter = document.querySelector('.fpsCounter');
const fpsValue = document.querySelector('.fpsValue');


const world = document.getElementById('world');
const world3d = document.getElementById('world3d');
const worldCreation = document.getElementById('worldCreation');
const ctx = world.getContext('2d');
const ctx3d = world3d.getContext('2d');
const ctxBuild = worldCreation.getContext('2d');

let editMode = false;

const bgTopImg = new Image();
bgTopImg.src = './stars.jpg'

// ctx.canvas.width = window.innerWidth / 2.2;
// ctx3d.canvas.width = window.innerWidth / 2.2;
// ctx.canvas.height = window.innerHeight / 1.2;
// ctx3d.canvas.height = window.innerHeight / 1.2;

let fpsInterval, now, then, elapsed, requestID;

let fullscreen = false;

const fps = 144;

let walls;
let lightSource;
let build = new Build(worldCreation, world);

let sprinting = false;

let showCorners = false;

let bgTopX = 0;
let bgTopDividend = 180;

let frames = 0;
const setFramerateValue = () => {
    fpsValue.innerText = frames;
    fpsValue.style.color = frames < 60 ? 'red' : 'rgb(0, 255, 0)';
    frames = 0;
}

const gameLoop = () => {
    requestID = requestAnimationFrame(gameLoop);
    
    now = Date.now();
    elapsed = now - then;
    
    if (elapsed > fpsInterval) {
        if (frames === 0) setTimeout(setFramerateValue, 1000)
        frames += 1;
        then = now - (elapsed % fpsInterval);

        ctx.clearRect(0, 0, world.width, world.height);
        ctx3d.clearRect(0, 0, world3d.width, world3d.height);
        ctxBuild.clearRect(0, 0, worldCreation.width, worldCreation.height);

        walls.draw();
        build.draw();

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

        const skyEndY = world3d.height * 0.4;

        ctx3d.drawImage(bgTopImg, bgTopX, 0, bgTopImg.width, skyEndY);
        ctx3d.drawImage(bgTopImg, bgTopX + bgTopImg.width, 0, bgTopImg.width, skyEndY);
        ctx3d.fillStyle = `rgba(0,0,0,0.7)`;
        ctx3d.fillRect(0, 0, world3d.width, skyEndY);
        ctx3d.fillStyle = `rgb(15, 35, 15)`;
        ctx3d.fillRect(0, skyEndY, world3d.width, world3d.height);

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

const beginLoop = () => {
    fpsInterval = 1000 / fps;
    then = Date.now();

    //show or hide canvas with rays based on fullscreen variable
    //lock & hide or unlock & show pointer based on fullscreen variable
    //set new wall layout
    if (fullscreen) {
        world3d.requestPointerLock = world3d.requestPointerLock || world3d.mozRequestPointerLock || world3d.webkitRequestPointerLock;
        world3d.requestPointerLock();
        world.style.display = 'none';
        world3d.classList.add('fullscreen');
        walls = new Walls(world, 10);
    } else {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock  || document.webkitExitPointerLock;
        document.exitPointerLock();
        world.style.display = 'block';
        world3d.classList.remove('fullscreen');
        walls = new Walls(world, 5);
    }

    lightSource = new LightSource(world, world3d, [], []);
    applySavedValues();
    lightSource.setAngles();

    gameLoop();
}

window.onload = () => {
    beginLoop();
}

function applySavedValues() {
    const savedFOV = JSON.parse(localStorage.getItem('fov'));
    const savedRayDensity = JSON.parse(localStorage.getItem('rayDensity'));
    const savedWalls = JSON.parse(localStorage.getItem('walls'));
    const fpsOn = JSON.parse(localStorage.getItem('fpsOn'));
    const playerPos = JSON.parse(localStorage.getItem('playerPos'));
    const playerRot = JSON.parse(localStorage.getItem('playerRot'));
    const showCornersSaved = JSON.parse(localStorage.getItem('showCorners'));

    showCorners = showCornersSaved;

    if (savedWalls) {
        walls.setWalls(savedWalls);
        lightSource.setWalls(savedWalls);
        if (showCorners) {
            const corners = walls.getCorners();
            walls.setCorners(corners);
            lightSource.setCorners(corners);
            toggleCornersBtn.classList.add('active');
        } else toggleCornersBtn.classList.remove('active');
    } else {
        walls.setWalls(defaultWalls);
        lightSource.setWalls(defaultWalls);
        if (showCorners) {
            const corners = walls.getCorners();
            walls.setCorners(corners);
            lightSource.setCorners(corners);
            toggleCornersBtn.classList.add('active');
        } else toggleCornersBtn.classList.remove('active');
        localStorage.setItem('walls', JSON.stringify(defaultWalls))
    }

    if (savedFOV) {
        fovValue.innerText = JSON.parse(savedFOV);
        lightSource.setFov(JSON.parse(savedFOV));
        fovSlider.value = savedFOV;
    }

    if (savedRayDensity) {
        qualityValue.innerText = 100 - JSON.parse(savedRayDensity);
        lightSource.setRayDensity(JSON.parse(savedRayDensity));
        qualitySlider.value = 100 - JSON.parse(savedRayDensity);
    }

    if (fpsOn) {
        fpsCounter.classList.add('active')
        toggleFPSBtn.classList.add('active')
    } else {
        fpsCounter.classList.remove('active')
        toggleFPSBtn.classList.remove('active')
    }

    if (playerPos) lightSource.setPlayerPos(playerPos[0], playerPos[1])
    if (playerRot) lightSource.setRotationValue(playerRot)
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'worldCreation') {
        const canvasPosX = e.clientX - e.target.getBoundingClientRect().x;
        const canvasPosY = e.clientY - e.target.getBoundingClientRect().y;
    
        build.addPoint(canvasPosX, canvasPosY);
        build.setP2Temp(canvasPosX, canvasPosY);
    }
})

document.addEventListener('mousemove', (e) => {
    //Set player angle and bg img position
    if (fullscreen) {
        lightSource.setMouseRotation(e.movementX / 20);
        bgTopX -= (bgTopImg.width / bgTopDividend) * e.movementX / 20;
        localStorage.setItem('playerRot', JSON.stringify(lightSource.getRotationValue()));
    }

    if (e.target.id === 'worldCreation') {
        const canvasPosX = e.clientX - e.target.getBoundingClientRect().x;
        const canvasPosY = e.clientY - e.target.getBoundingClientRect().y;
        build.setP2Temp(canvasPosX, canvasPosY);
    }
})

document.addEventListener('keydown', (e) => {
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
            localStorage.setItem('playerPos', JSON.stringify(lightSource.getPlayerPos()));
        }
    } else {
        if ((e.code === 'KeyA') || (e.code === 'KeyD')) {
            lightSource.setRotation(null);
            localStorage.setItem('playerRot', JSON.stringify(lightSource.getRotationValue()));
        }
    } 

    if ((e.code === 'KeyW') || (e.code === 'KeyS')) {
        lightSource.setMoveDir(null);
        localStorage.setItem('playerPos', JSON.stringify(lightSource.getPlayerPos()));
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
        // if (window.getComputedStyle(world).display === 'none') {
        //     world.style.display = 'block';
        // } else {
        //     world.style.display = 'none';
        // }
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

    // if (e.code === 'KeyB' && !fullscreen) {
    //     if (!editMode) {
    //         world.style.display = 'none';
    //         world3d.style.display = 'none';
    //         worldCreation.style.display = 'block';
    //         editMode = true;
    //     } else {
    //         const newWalls = walls.getWalls();
    //         walls.setWalls(newWalls);
    //         lightSource.setWalls(newWalls);
    //         world.style.display = 'block';
    //         world3d.style.display = 'block';
    //         worldCreation.style.display = 'none';
    //         editMode = false;
    //     }
    // }
})

// Settings

qualitySlider.oninput = () => {
    qualityValue.innerText = JSON.parse(qualitySlider.value);
    lightSource.setRayDensity(100 - JSON.parse(qualitySlider.value));
}

fovSlider.oninput = () => {
    fovValue.innerText = JSON.parse(fovSlider.value);
    lightSource.setFov(JSON.parse(fovSlider.value));
}

resetSettingsBtn.onclick = () => {
    const fovReset = 45;
    const rayDReset = 12;

    walls.setCorners([]);
    lightSource.setCorners([]);
    toggleCornersBtn.classList.remove('active');
    localStorage.setItem('showCorners', JSON.stringify(false));
    showCorners = false;

    fovValue.innerText = fovReset;
    lightSource.setFov(fovReset);
    fovSlider.value = fovReset;

    qualityValue.innerText = 100 - rayDReset;
    lightSource.setRayDensity(rayDReset);
    qualitySlider.value = 100 - rayDReset;
}

settingsBtn.onclick = () => settings.classList.toggle('show');

function exitEditor() {
    world.style.display = 'block';
    world3d.style.display = 'block';
    worldCreationContainer.style.display = 'none';
    settings.style.display = 'flex';
    editMode = false;
}

function enterEditor() {
    world.style.display = 'none';
    world3d.style.display = 'none';
    worldCreationContainer.style.display = 'flex';
    settings.style.display = 'none';
    editMode = true;
}

wallEditorBtn.onclick = () => {
    if (!editMode) {
        const newWalls = JSON.parse(localStorage.getItem('walls'));
        if (newWalls) build.loadSavedWalls(newWalls);
        enterEditor();
    }
}

toggleFPSBtn.onclick = () => {
    fpsCounter.classList.toggle('active')
    toggleFPSBtn.classList.toggle('active')
    if (toggleFPSBtn.classList.contains('active')) {
        localStorage.setItem('fpsOn', true);
    } else localStorage.setItem('fpsOn', false);
}

toggleCornersBtn.onclick = () => {
    showCorners = !showCorners;
    
    if (showCorners) {
        const corners = walls.getCorners();
        walls.setCorners(corners);
        lightSource.setCorners(corners);
        toggleCornersBtn.classList.add('active');
    } else {
        walls.setCorners([]);
        lightSource.setCorners([]);
        toggleCornersBtn.classList.remove('active');
    }

    localStorage.setItem('showCorners', JSON.stringify(showCorners));
}

// In-Editor Settings

exitEditorBtn.onclick = () => exitEditor()

clearEditorBtn.onclick = () => {
    build.clearWalls();
    ctxBuild.clearRect(0, 0, worldCreation.width, worldCreation.height);
}

saveWallsBtn.onclick = () => {
    const newWalls = build.getWalls();
    walls.setWalls(newWalls);
    lightSource.setWalls(newWalls);
    if (showCorners) {
        const corners = walls.getCorners();
        walls.setCorners(corners);
        lightSource.setCorners(corners);
        toggleCornersBtn.classList.add('active');
    }

    localStorage.setItem('walls', JSON.stringify(newWalls))

    exitEditor()
}

undoBtn.onclick = () => build.removeLastWall();

defaultMapBtn.onclick = () => build.setWalls(defaultWalls);