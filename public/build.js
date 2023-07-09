export default class Build {
	constructor(worldCreation, world) {
		this.worldCreation = worldCreation;
		this.world = world;
		this.ctx = this.worldCreation.getContext('2d');
		this.lineActive = false;
		this.walls = [];
		this.sprites = [];
		this.p1 = {};
		this.mousePos = {};
		this.allPoints = {
			walls: [],
			sprites: [],
		};
		this.pointColor = 'rgba(255,0,0,1)';
		this.actualCanvasWidth = 1920;
		this.actualCanvasHeight = 1200;
		this.addingSprite = false;
		this.deletedMaps = [];
	}

	getWalls() {
		if (!this.walls[0]) {
			this.addEdgeWalls();
		}

		return [...this.walls];
	}

	getSprites() {
		return [...this.sprites];
	}

	getMap() {
		return { ...this.allPoints };
	}

	setAddingSprite(addingSprite) {
		this.addingSprite = addingSprite;
	}

	getAddingSprite() {
		return this.addingSprite;
	}

	addSpritePoint() {
		this.sprites.push({
			x: this.mousePos.x,
			y: this.mousePos.y,
		});

		this.allPoints.sprites.push({
			pos: this.getNextPosValue(),
			x: this.mousePos.x,
			y: this.mousePos.y,
		});
	}

	clearCurLines() {
		this.p1 = {};
		this.mousePos = {};
	}

	setMapFromAllPoints(map) {
		if (!this.walls.length) this.addEdgeWalls();

		for (let i = 0; i < map.walls?.length; i++) {
			if (i % 2 === 0) {
				this.walls.push({
					x1: map.walls[i].x,
					y1: map.walls[i].y,
					x2: map.walls[i + 1].x,
					y2: map.walls[i + 1].y,
				});
			}
		}

		for (let i = 0; i < map.sprites?.length; i++) {
			this.sprites.push({
				x: map.sprites[i].x,
				y: map.sprites[i].y,
			});
		}
	}

	setMap(map) {
		this.allPoints = map;
		this.p1 = {};
		this.mousePos = {};
		this.walls = [];
		this.sprites = [];

		this.setMapFromAllPoints(map);
	}

	addEdgeWalls() {
		this.walls.push(
			{
				x1: 0,
				y1: 0,
				x2: 0,
				y2: this.world.height,
			},
			{
				x1: 0,
				y1: 0,
				x2: this.world.width,
				y2: 0,
			},
			{
				x1: this.world.width,
				y1: 0,
				x2: this.world.width,
				y2: this.world.height,
			},
			{
				x1: this.world.width,
				y1: this.world.height,
				x2: 0,
				y2: this.world.height,
			}
		);
	}

	getNextPosValue() {
		return (
			Math.max(
				this.allPoints.walls?.[this.allPoints.walls.length - 1]?.pos || 0,
				this.allPoints.sprites?.[this.allPoints.sprites.length - 1]?.pos || 0,
				this.deletedMaps?.[this.deletedMaps.length - 1]?.pos || 0
			) + 1
		);
	}

	clearMap() {
		this.walls = [];
		this.sprites = [];
		if (this.allPoints.walls.length || this.allPoints.sprites.length)
			this.deletedMaps.push({ map: { ...this.allPoints }, pos: this.getNextPosValue() });
		this.allPoints = {
			walls: [],
			sprites: [],
		};
		this.p1 = {};
		this.mousePos = {};
	}

	getLastPositionArrType() {
		const lastWallPos = this.allPoints.walls?.[this.allPoints.walls.length - 1]?.pos || 0; // Last wall pushed to allPoints
		const lastSpritePos = this.allPoints.sprites?.[this.allPoints.sprites.length - 1]?.pos || 0; // Last sprite pushed to allPoints
		const lastDeletedMapPos = this.deletedMaps?.[this.deletedMaps.length - 1]?.pos || 0; // Last map pushed to deletedMaps

		const maxPos = Math.max(lastWallPos, lastSpritePos, lastDeletedMapPos);
		if (lastWallPos === maxPos) return 'walls';
		else if (lastSpritePos === maxPos) return 'sprites';
		else if (lastDeletedMapPos === maxPos) return 'deletedMaps';
		return null;
	}

	removeFromStack() {
		if (this.p1?.x) {
			this.p1 = {};
			this.allPoints.walls.pop();
		} else {
			const arrTypeToRemoveFrom = this.getLastPositionArrType(); // Find the array that contains the last item added to the map
			if (arrTypeToRemoveFrom === 'walls') {
				this.walls.pop();
				this.allPoints.walls.pop();
				this.allPoints.walls.pop();
			} else if (arrTypeToRemoveFrom === 'sprites') {
				this.sprites.pop();
				this.allPoints.sprites.pop();
			} else if (arrTypeToRemoveFrom === 'deletedMaps') {
				const lastDeleted = this.deletedMaps.pop();
				this.allPoints = lastDeleted.map;
				this.setMapFromAllPoints(this.allPoints);
			}

			// if (
			// 	(this.allPoints.walls?.[this.allPoints.walls.length - 1]?.pos || 0) >
			// 	(this.allPoints.sprites?.[this.allPoints.sprites.length - 1]?.pos || 0)
			// ) {
			// 	this.walls.pop();
			// 	this.allPoints.walls.pop();
			// 	this.allPoints.walls.pop();
			// } else {
			// 	this.sprites.pop();
			// 	this.allPoints.sprites.pop();
			// }
		}
	}

	setMousePos(canvasPosX, canvasPosY) {
		// if (this.p1?.x || this.addingSprite) {
		const actualToDisplayedRatioX = this.actualCanvasWidth / this.worldCreation.getBoundingClientRect().width;
		const actualToDisplayedRatioY =
			this.actualCanvasHeight / this.worldCreation.getBoundingClientRect().height;
		this.mousePos.x = canvasPosX * actualToDisplayedRatioX;
		this.mousePos.y = canvasPosY * actualToDisplayedRatioY;
		// }
	}

	addWallPoint(canvasPosX, canvasPosY) {
		if (!this.walls[0]) this.addEdgeWalls();

		const actualToDisplayedRatioX = this.actualCanvasWidth / this.worldCreation.getBoundingClientRect().width;
		const actualToDisplayedRatioY =
			this.actualCanvasHeight / this.worldCreation.getBoundingClientRect().height;
		let x = canvasPosX * actualToDisplayedRatioX;
		let y = canvasPosY * actualToDisplayedRatioY;

		for (let i = 0; i < this.allPoints.walls?.length; i++) {
			if (this.p1?.x && Math.abs(x - this.p1.x) <= 15 && Math.abs(y - this.p1.y) <= 15) {
				this.p1 = {};
				return;
			}

			if (Math.abs(x - this.allPoints.walls[i].x) <= 15 && Math.abs(y - this.allPoints.walls[i].y) <= 15) {
				x = this.allPoints.walls[i].x;
				y = this.allPoints.walls[i].y;
				break;
			}
		}

		if (!this.p1?.x) {
			this.p1 = { x, y };
		} else {
			this.walls.push({
				x1: this.p1.x,
				y1: this.p1.y,
				x2: x,
				y2: y,
			});

			this.allPoints.walls.push(
				{
					pos: this.getNextPosValue(),
					x: this.p1.x,
					y: this.p1.y,
				},
				{
					pos: this.getNextPosValue() + 1,
					x: x,
					y: y,
				}
			);
			this.p1 = {};
		}
	}

	handleWorldClick(canvasPosX, canvasPosY) {
		if (this.addingSprite) {
			this.addSpritePoint(canvasPosX, canvasPosY);
		} else {
			this.addWallPoint(canvasPosX, canvasPosY);
		}
	}

	draw() {
		for (let walls of this.walls) {
			this.ctx.beginPath();
			this.ctx.moveTo(walls.x1, walls.y1);
			this.ctx.lineTo(walls.x2, walls.y2);
			this.ctx.lineWidth = 2;
			this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
			this.ctx.stroke();
		}

		for (let sprite of this.sprites) {
			this.ctx.beginPath();
			this.ctx.fillStyle = 'rgba(245,230,66,0.8)';
			this.ctx.ellipse(sprite.x, sprite.y, 8, 8, Math.PI / 4, 0, 2 * Math.PI);
			this.ctx.fill();
		}

		if (this.p1?.x) {
			this.ctx.beginPath();
			this.ctx.moveTo(this.p1.x, this.p1.y);
			this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
			this.ctx.lineWidth = 2;
			this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
			this.ctx.stroke();
		}

		if (this.addingSprite) {
			this.ctx.fillStyle = 'rgba(245,230,66,0.8)';
			this.ctx.beginPath();
			this.ctx.ellipse(this.mousePos.x, this.mousePos.y, 8, 8, Math.PI / 4, 0, 2 * Math.PI);
			this.ctx.fill();
		}
	}
}
