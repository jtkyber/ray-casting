import Build from './build.js';
import defaultMap from './defaultMap.js';
import LightSource from './lightSource.js';
import Walls from './walls.js';
import Walls3d from './walls3d.js';

// Variables -----------------------------------------------------------------------
const qualitySlider = document.querySelector('#quality');
const fovSlider = document.querySelector('#fov');
const fpsCapSlider = document.querySelector('#fpsCap');

const qualityValue = document.querySelector('#qualityValue');
const fovValue = document.querySelector('#fovValue');
const fpsCapValue = document.querySelector('#fpsCapValue');

const resetSettingsBtn = document.querySelector('#resetSettingsBtn');
const settingsBtn = document.querySelector('#settingsBtn');
const settings = document.querySelector('.settings');
const worldCreationContainer = document.querySelector('.worldCreationContainer');
const toggleFPSBtn = document.querySelector('#toggleFPSBtn');
const toggleCornersBtn = document.querySelector('#toggleCornersBtn');
const mapEditorBtn = document.querySelector('#mapEditorBtn');

const saveWallsBtn = document.querySelector('#saveWallsBtn');
const undoBtn = document.querySelector('#undoBtn');
const addSpriteBtn = document.querySelector('#addSpriteBtn');
const clearEditorBtn = document.querySelector('#clearEditorBtn');
const defaultMapBtn = document.querySelector('#defaultMapBtn');
const exitEditorBtn = document.querySelector('#exitEditorBtn');

const fpsCounter = document.querySelector('.fpsCounter');
const fpsValue = document.querySelector('.fpsValue');

const world = document.getElementById('world');
const world3d = document.getElementById('world3d');
const worldCreation = document.getElementById('worldCreation');

const ctx = world.getContext('2d');
const ctx3d = world3d.getContext('2d');
const ctxBuild = worldCreation.getContext('2d');

let editMode = false;

let fpsInterval, now, then, elapsed, requestID;

let fullscreen = false;

const fpsValues = [30, 45, 60, 75, 120, 144];
let fpsCap = fpsCapValue.innerText;

let walls;
let lightSource;
const walls3d = new Walls3d(world3d, 45);
let build = new Build(worldCreation, world);

let sprinting = false;

let showCorners = false;

let frames = 0;

const setFramerateValue = () => {
	fpsValue.innerText = frames;
	fpsValue.style.color = frames < fpsCap ? 'red' : 'rgb(0, 255, 0)';
	frames = 0;
};

const gameLoop = () => {
	requestID = requestAnimationFrame(gameLoop);

	fpsInterval = 1000 / fpsCap;

	now = Date.now();
	elapsed = now - then;

	if (elapsed > fpsInterval) {
		if (frames === 0) setTimeout(setFramerateValue, 1000);
		frames += 1;
		then = now - (elapsed % fpsInterval);

		ctx.clearRect(0, 0, world.width, world.height);
		ctx3d.clearRect(0, 0, world3d.width, world3d.height);
		ctxBuild.clearRect(0, 0, worldCreation.width, worldCreation.height);

		walls.draw();
		build.draw();

		//move the bg img when rotating with keys
		walls3d.setbgTopX(lightSource.rotationAmt, lightSource.moveDirLR);

		const sprites = walls.getSprites();
		lightSource.setSprites(sprites);

		lightSource.draw();
		lightSource.rotate();
		lightSource.move();

		ctx3d.strokeStyle = `rgba(255,0,0,1)`;
		ctx3d.lineWidth = 2;
		ctx3d.beginPath();
		ctx3d.ellipse(world3d.width / 2, world3d.height / 2, 3, 3, 0, 0, 2 * Math.PI);
		ctx3d.stroke();

		const playerPos = lightSource.getPlayerPos();
		walls.setPlayerPos(playerPos);
	}
};

const beginLoop = () => {
	then = Date.now();

	//show or hide canvas with rays based on fullscreen variable
	//lock & hide or unlock & show pointer based on fullscreen variable
	//set new wall layout
	if (fullscreen) {
		world3d.requestPointerLock =
			world3d.requestPointerLock || world3d.mozRequestPointerLock || world3d.webkitRequestPointerLock;
		world3d.requestPointerLock({
			unadjustedMovement: true,
		});
		world.style.display = 'none';
		world3d.classList.add('fullscreen');
		walls = new Walls(world, 10);
	} else {
		document.exitPointerLock =
			document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
		document.exitPointerLock();
		world.style.display = 'block';
		world3d.classList.remove('fullscreen');
		walls = new Walls(world, 5);
	}

	lightSource = new LightSource(world, world3d, [], [], walls3d);
	applySavedValues();
	lightSource.setAngles();

	gameLoop();
};

window.onload = () => {
	beginLoop();
};

function applySavedValues() {
	const savedMap = JSON.parse(localStorage.getItem('map'));
	const savedFOV = JSON.parse(localStorage.getItem('fov'));
	const savedFpsCap = JSON.parse(localStorage.getItem('fpsCap'));
	const savedRayDensity = JSON.parse(localStorage.getItem('rayDensity'));
	const fpsOn = JSON.parse(localStorage.getItem('fpsOn'));
	const playerPos = JSON.parse(localStorage.getItem('playerPos'));
	const playerRot = JSON.parse(localStorage.getItem('playerRot'));
	const showCornersSaved = JSON.parse(localStorage.getItem('showCorners'));

	showCorners = showCornersSaved;

	if (Array.isArray(savedMap?.walls) || Array.isArray(savedMap?.sprites)) {
		build.setMap(savedMap);

		const w = build.getWalls();
		const s = build.getSprites();

		walls.setWalls([...w]);
		walls.setSprites([...s]);
		lightSource.setWalls([...w]);
		lightSource.setSprites([...s]);

		if (showCorners) {
			const corners = walls.getCorners();
			walls.setCorners(corners);
			lightSource.setCorners(corners);
			toggleCornersBtn.classList.add('active');
		} else toggleCornersBtn.classList.remove('active');
	} else {
		build.setMap({ ...defaultMap });

		const w = build.getWalls();
		const s = build.getSprites();

		walls.setWalls([...w]);
		walls.setSprites([...s]);
		lightSource.setWalls([...w]);
		lightSource.setSprites([...s]);

		if (showCorners) {
			const corners = walls.getCorners();
			walls.setCorners(corners);
			lightSource.setCorners(corners);
			toggleCornersBtn.classList.add('active');
		} else toggleCornersBtn.classList.remove('active');

		localStorage.setItem('map', JSON.stringify({ ...defaultMap }));
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

	if (savedFpsCap) {
		fpsCapValue.innerText = savedFpsCap;
		fpsCap = JSON.parse(savedFpsCap);

		for (let i = 0; i < fpsValues.length; i++) {
			if (fpsValues[i] === fpsCap) {
				fpsCapSlider.value = i;
				break;
			}
		}
	}

	if (fpsOn !== null) {
		if (fpsOn) {
			fpsCounter.classList.add('active');
			toggleFPSBtn.classList.add('active');
		} else {
			fpsCounter.classList.remove('active');
			toggleFPSBtn.classList.remove('active');
		}
	} else {
		fpsCounter.classList.add('active');
		toggleFPSBtn.classList.add('active');
	}

	if (playerPos) lightSource.setPlayerPos(playerPos[0], playerPos[1]);
	if (playerRot) lightSource.setRotationValue(playerRot);
}

document.addEventListener('click', e => {
	if (e.target.id === 'worldCreation') {
		const canvasPosX = e.clientX - e.target.getBoundingClientRect().x;
		const canvasPosY = e.clientY - e.target.getBoundingClientRect().y;

		build.handleWorldClick(canvasPosX, canvasPosY);
	}
});

document.addEventListener('mousemove', e => {
	//Set player angle and bg img position
	if (fullscreen) {
		lightSource.setMouseRotation(e.movementX / 20);
		walls3d.setWallCenterHeight(e.movementY);
		walls3d.setBgTopXMouseMove(e.movementX);
		localStorage.setItem('playerRot', JSON.stringify(lightSource.getRotationValue()));
	}

	if (e.target.id === 'worldCreation') {
		const canvasPosX = e.clientX - e.target.getBoundingClientRect().x;
		const canvasPosY = e.clientY - e.target.getBoundingClientRect().y;
		build.setMousePos(canvasPosX, canvasPosY);
	}
});

document.addEventListener('keydown', e => {
	//Set move forewards and backwards
	if (e.code === 'KeyW') {
		lightSource.setMoveDir('forwards');
	} else if (e.code === 'KeyS') {
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

	if (e.code === 'Space') {
		walls3d.setJumping(true);
	}
});

document.addEventListener('keyup', e => {
	//Set movement variables to null when key released
	if (fullscreen) {
		if (e.code === 'KeyA' || e.code === 'KeyD') {
			lightSource.setStrafeDir(null);
			localStorage.setItem('playerPos', JSON.stringify(lightSource.getPlayerPos()));
		}
	} else {
		if (e.code === 'KeyA' || e.code === 'KeyD') {
			lightSource.setRotation(null);
			localStorage.setItem('playerRot', JSON.stringify(lightSource.getRotationValue()));
		}
	}

	if (e.code === 'KeyW' || e.code === 'KeyS') {
		lightSource.setMoveDir(null);
		localStorage.setItem('playerPos', JSON.stringify(lightSource.getPlayerPos()));
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
		beginLoop(fpsCap);
	}

	if (e.code === 'ShiftLeft') {
		sprinting = false;
		if (lightSource.moveDirFB) {
			lightSource.moveAmt = lightSource.moveAmtTop;
		} else {
			lightSource.moveAmt = lightSource.moveAmtStart;
		}
	}
});

// Settings

qualitySlider.oninput = () => {
	qualityValue.innerText = JSON.parse(qualitySlider.value);
	lightSource.setRayDensity(100 - JSON.parse(qualitySlider.value));
	localStorage.setItem('rayDensity', JSON.stringify(100 - JSON.parse(qualitySlider.value)));
};

fovSlider.oninput = () => {
	fovValue.innerText = JSON.parse(fovSlider.value);
	lightSource.setFov(JSON.parse(fovSlider.value));
	localStorage.setItem('fov', fovSlider.value);
};

fpsCapSlider.oninput = () => {
	fpsCapValue.innerText = fpsValues[JSON.parse(fpsCapSlider.value)];
	fpsCap = JSON.parse(fpsCapValue.innerText);
	localStorage.setItem('fpsCap', fpsCap);
};

resetSettingsBtn.onclick = () => {
	const fovReset = 45;
	const rayDReset = 8;
	const fpsCapReset = 60;

	walls.setCorners([]);
	lightSource.setCorners([]);
	toggleCornersBtn.classList.remove('active');
	localStorage.setItem('showCorners', JSON.stringify(false));
	showCorners = false;

	qualityValue.innerText = 100 - rayDReset;
	lightSource.setRayDensity(rayDReset);
	qualitySlider.value = 100 - rayDReset;
	localStorage.setItem('rayDensity', JSON.stringify(rayDReset));

	fovValue.innerText = fovReset;
	lightSource.setFov(fovReset);
	fovSlider.value = fovReset;
	localStorage.setItem('fov', JSON.stringify(fovReset));

	fpsCapValue.innerText = fpsCapReset;
	fpsCap = fpsCapReset;
	for (let i = 0; i < fpsValues.length; i++) {
		if (fpsValues[i] === fpsCap) {
			fpsCapSlider.value = i;
			break;
		}
	}
	localStorage.setItem('fpsCap', JSON.stringify(fpsCapReset));

	fpsCounter.classList.add('active');
	toggleFPSBtn.classList.add('active');
	localStorage.setItem('fpsOn', true);
};

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

mapEditorBtn.onclick = () => {
	if (!editMode) {
		const savedMap = JSON.parse(localStorage.getItem('map'));

		if (savedMap) build.setMap({ ...savedMap });
		enterEditor();
	}
};

toggleFPSBtn.onclick = () => {
	fpsCounter.classList.toggle('active');
	toggleFPSBtn.classList.toggle('active');
	if (toggleFPSBtn.classList.contains('active')) {
		localStorage.setItem('fpsOn', true);
	} else localStorage.setItem('fpsOn', false);
};

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
};

// In-Editor Settings

exitEditorBtn.onclick = () => exitEditor();

clearEditorBtn.onclick = () => {
	build.clearMap();
	ctxBuild.clearRect(0, 0, worldCreation.width, worldCreation.height);
};

saveWallsBtn.onclick = () => {
	const newMap = build.getMap();

	const newWalls = build.getWalls();
	const newSprites = build.getSprites();
	walls.setWalls(newWalls);
	walls.setSprites(newSprites);
	lightSource.setWalls(newWalls);
	lightSource.setSprites(newSprites);

	if (showCorners) {
		const corners = walls.getCorners();
		walls.setCorners(corners);
		lightSource.setCorners(corners);
		toggleCornersBtn.classList.add('active');
	}

	localStorage.setItem('map', JSON.stringify(newMap));

	exitEditor();
};

undoBtn.onclick = () => {
	build.removeFromStack();
};

addSpriteBtn.onclick = () => {
	const addingSprite = !build.getAddingSprite();

	if (addingSprite) {
		addSpriteBtn.classList.add('active');
		build.clearCurLines();
	} else {
		addSpriteBtn.classList.remove('active');
	}

	build.setAddingSprite(addingSprite);
};

defaultMapBtn.onclick = () => {
	build.setMap({ ...defaultMap });
};
