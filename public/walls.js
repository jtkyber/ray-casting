export default class Walls {
	constructor(world, wallNum) {
		this.world = world;
		this.walls = [];
		this.sprites = [];
		this.perpSprites = [];
		this.corners = [];
		this.wallNum = wallNum;
		this.minWallWidth = 10;
		this.maxWallWidth = 20;
		this.playerX = 0;
		this.playerY = 0;
		this.spriteWidth = 10;
		this.x1 = 0;
		this.y1 = 0;
		this.x2 = 0;
		this.y2 = 0;
		this.x3 = 0;
		this.y3 = 0;
		this.x4 = 0;
		this.y4 = 0;
	}

	setPlayerPos([x, y]) {
		this.playerX = x;
		this.playerY = y;
	}

	getWalls() {
		if (!this.walls[0]) {
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

		return [...this.walls];
	}

	getSprites() {
		return [...this.perpSprites];
	}

	pointIsBetween(x1, y1, x2, y2, px, py) {
		return px > Math.min(x1, x2) && px < Math.max(x1, x2) && py > Math.min(y1, y2) && py < Math.max(y1, y2);
	}

	getCorners() {
		let corners = [];
		for (const lineA of this.walls) {
			this.x1 = lineA.x1;
			this.y1 = lineA.y1;
			this.x2 = lineA.x2;
			this.y2 = lineA.y2;

			for (const lineB of this.walls) {
				this.x3 = lineB.x1;
				this.y3 = lineB.y1;
				this.x4 = lineB.x2;
				this.y4 = lineB.y2;
				if ((this.x1 === this.x3 && this.y1 === this.y3) || (this.x1 === this.x4 && this.y1 === this.y4)) {
					corners.push({
						x: this.x1,
						y: this.y1,
					});
				} else if (
					(this.x2 === this.x3 && this.y2 === this.y3) ||
					(this.x2 === this.x4 && this.y2 === this.y4)
				) {
					corners.push({
						x: this.x2,
						y: this.y2,
					});
				} else if (this.x1 !== this.x3 && this.y1 !== this.y3 && this.x2 !== this.x4 && this.y2 !== this.y4) {
					const denom = (this.x1 - this.x2) * (this.y3 - this.y4) - (this.y1 - this.y2) * (this.x3 - this.x4);
					if (denom !== 0) {
						const t =
							((this.x1 - this.x3) * (this.y3 - this.y4) - (this.y1 - this.y3) * (this.x3 - this.x4)) / denom;
						const u =
							((this.x1 - this.x3) * (this.y1 - this.y2) - (this.y1 - this.y3) * (this.x1 - this.x2)) / denom;

						if (t > 0 && t < 1 && u > 0) {
							const px = this.x3 + u * (this.x4 - this.x3);
							const py = this.y3 + u * (this.y4 - this.y3);

							if (
								this.pointIsBetween(this.x1, this.y1, this.x2, this.y2, px, py) &&
								this.pointIsBetween(this.x3, this.y3, this.x4, this.y4, px, py)
							) {
								corners.push({
									x: px,
									y: py,
								});
							}
						}
					}
				}
			}
		}
		return corners;
	}

	setWalls(allWalls) {
		this.walls = allWalls;
	}

	setSprites(sprites) {
		this.sprites = [...sprites];
		this.perpSprites = [...sprites];
	}

	setCorners(corners) {
		this.corners = [...corners];
	}

	// build = () => {
	//     for (let i = 0; i < this.wallNum; i++) {
	//         let x1, y1, x2, y2;
	//         let firstX1, firstY1;
	//         for (let j = 0; j < 4; j++) {
	//             if (j === 0) {
	//                 x1 = firstX1 = Math.floor(Math.random() * (this.world.width - this.maxWallWidth));
	//                 y1 = firstY1 = Math.floor(Math.random() * (this.world.height - this.maxWallWidth));
	//                 x2 = Math.floor(Math.random() * (this.world.width - this.maxWallWidth));
	//                 y2 = Math.floor(Math.random() * (this.world.height - this.maxWallWidth));
	//             } else if (j === 1) {
	//                 x1 = x2;
	//                 y1 = y2;
	//                 x2 = x1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
	//                 y2 = y1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
	//             } else if (j === 2) {
	//                 x1 = x2;
	//                 y1 = y2;
	//                 x2 = firstX1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
	//                 y2 = firstY1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
	//             } else if (j === 3) {
	//                 x1 = x2;
	//                 y1 = y2;
	//                 x2 = firstX1;
	//                 y2 = firstY1;
	//             }

	//             this.walls.push({
	//                 x1: x1,
	//                 y1: y1,
	//                 x2: x2,
	//                 y2: y2
	//             })
	//         }
	//     }

	//     this.walls.push(
	//         {
	//             x1: 0,
	//             y1: 0,
	//             x2: 0,
	//             y2: this.world.height
	//         },
	//         {
	//             x1: 0,
	//             y1: 0,
	//             x2: this.world.width,
	//             y2: 0
	//         },
	//         {
	//             x1: this.world.width,
	//             y1: 0,
	//             x2: this.world.width,
	//             y2: this.world.height
	//         },
	//         {
	//             x1: this.world.width,
	//             y1: this.world.height,
	//             x2: 0,
	//             y2: this.world.height
	//         }
	//     )

	//     for (const line of this.walls) {
	//         this.getIntersection(line.x1, line.y1, line.x2, line.y2);
	//     }

	//     return [this.walls, this.corners];
	// }

	toDegrees(angle) {
		return angle * (180 / Math.PI);
	}

	toRadians(angle) {
		return angle * (Math.PI / 180);
	}

	makeSpritesPerp() {
		const deltaD = this.spriteWidth / 2;
		for (let i = 0; i < this.sprites.length; i++) {
			if (!this.perpSprites[i]) this.perpSprites.push({});
			const { x, y } = this.sprites[i];
			const slope = (y - this.playerY) / (x - this.playerX);
			const perpSlope = -(1 / slope);
			const angle = Math.atan(perpSlope);
			this.perpSprites[i].x1 = x + deltaD * Math.cos(angle);
			this.perpSprites[i].y1 = y + deltaD * Math.sin(angle);
			this.perpSprites[i].x2 = x - deltaD * Math.cos(angle);
			this.perpSprites[i].y2 = y - deltaD * Math.sin(angle);
		}
	}

	draw() {
		this.makeSpritesPerp();
		const ctx = this.world.getContext('2d');

		for (const line of this.walls) {
			ctx.beginPath();
			ctx.moveTo(line.x1, line.y1);
			ctx.lineTo(line.x2, line.y2);
			ctx.lineWidth = 3;
			ctx.strokeStyle = 'rgba(255,255,255,0.8)';
			ctx.stroke();
		}

		for (const sprite of this.perpSprites) {
			ctx.beginPath();
			ctx.moveTo(sprite.x1, sprite.y1);
			ctx.lineTo(sprite.x2, sprite.y2);
			ctx.lineWidth = 6;
			ctx.strokeStyle = 'rgba(245,230,66,1)';
			ctx.stroke();
		}

		// const edgeWalls = [
		//     {
		//         x1: 0,
		//         y1: 0,
		//         x2: 0,
		//         y2: this.world.height
		//     },
		//     {
		//         x1: 0,
		//         y1: 0,
		//         x2: this.world.width,
		//         y2: 0
		//     },
		//     {
		//         x1: this.world.width,
		//         y1: 0,
		//         x2: this.world.width,
		//         y2: this.world.height
		//     },
		//     {
		//         x1: this.world.width,
		//         y1: this.world.height,
		//         x2: 0,
		//         y2: this.world.height
		//     }
		// ]

		// for (const line of edgeWalls) {;
		//     ctx.beginPath();
		//     ctx.moveTo(line.x1, line.y1);
		//     ctx.lineTo(line.x2, line.y2);
		//     ctx.lineWidth = 3;
		//     ctx.strokeStyle = "rgba(255,255,255,0.8)";
		//     ctx.stroke();
		// }

		for (const corner of this.corners) {
			ctx.beginPath();
			ctx.fillStyle = 'rgba(255,0,0,1)';
			ctx.ellipse(corner.x, corner.y, 2, 2, 0, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
}
