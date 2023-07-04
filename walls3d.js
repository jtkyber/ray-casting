export default class Walls3d {
	constructor(world3d, fov) {
		this.world3d = world3d
		this.fov = fov
		this.ctx = world3d.getContext('2d')
		this.world3dDiag = Math.sqrt(Math.pow(world3d.width, 2) + Math.pow(world3d.height, 2))
		this.bgTopImg = new Image()
		this.bgTopImg.src = './stars.jpg'
		this.wallTexture = new Image()
		this.wallTexture.src = './brickTexture.png'
		this.worldHalfHeight = world3d.height / 2
		this.wallCenterHeightOriginal = this.world3d.height / 2.5
		this.jumpStep = 6
		this.jumpIterations = 0
		this.isJumping = false
		this.rayNum = 0
		this.spriteNum = 0
		this.bgTopX = 0
		this.mapPixelW = this.world3d.width
		this.mapPixelH = this.world3d.height
		this.wallWidth = this.world3d.width / this.rayNum
		this.wallWidthOversized = this.wallWidth + 1
		this.spriteWidthOversized = this.wallWidth + 12
	}

	setWallCenterHeight(amt) {
		if (amt > 0 && this.wallCenterHeightOriginal <= -world3d.height / 2) return
		if (amt < 0 && this.wallCenterHeightOriginal >= this.world3d.height) return
		this.wallCenterHeightOriginal -= amt
	}

	// getWallCenterHeight() {
	// 	return this.wallCenterHeightOriginal
	// }

	setJumping(isJumping) {
		this.isJumping = isJumping
	}

	jump(rayLength, wallCenterHeight, rayIndex) {
		if (rayIndex === 0) {
			this.jumpStep -= 0.2
			this.jumpIterations += 1
		}

		const jumpOffset = this.world3d.height / rayLength

		if (this.jumpStep > 0) {
			return (wallCenterHeight += this.jumpStep * this.jumpIterations * jumpOffset)
		} else if (wallCenterHeight > this.wallCenterHeightOriginal) {
			return (wallCenterHeight += this.jumpStep * this.jumpIterations * jumpOffset)
		} else if (wallCenterHeight <= this.wallCenterHeightOriginal) {
			this.jumpStep = 6
			this.isJumping = false
			this.jumpIterations = 0
		}
		return wallCenterHeight
	}

	setBgTopXMouseMove(moveDelta) {
		this.bgTopX -= ((this.bgTopImg.width / 180) * moveDelta) / 20
	}

	setbgTopX(rotAmt, moveDirLR) {
		const xDelta = (this.bgTopImg.width / 180) * rotAmt
		if (moveDirLR === 'left') {
			this.bgTopX += xDelta
		} else if (moveDirLR === 'right') {
			this.bgTopX -= xDelta
		}
	}

	drawBackground() {
		//multiply bg img width by 4 so when you rotate 90deg, you're 1/4th through the img
		this.bgTopImg.width = this.world3d.width * 2
		this.bgTopImg.height = this.world3d.height

		//reset bg img position if ends of img are in view
		if (this.bgTopX > 0) {
			this.bgTopX = -this.bgTopImg.width
		} else if (this.bgTopX < -this.bgTopImg.width) {
			this.bgTopX = 0
		}

		const skyEndY = this.wallCenterHeightOriginal
		// const skyEndY = walls3d.wallCenterHeight + walls3d.jumpVel;

		this.ctx.drawImage(this.bgTopImg, this.bgTopX, skyEndY, this.bgTopImg.width, -this.bgTopImg.height)
		this.ctx.drawImage(
			this.bgTopImg,
			this.bgTopX + this.bgTopImg.width,
			skyEndY,
			this.bgTopImg.width,
			-this.bgTopImg.height
		)
		this.ctx.fillStyle = `rgba(0,0,0,0.7)`
		this.ctx.fillRect(0, 0, world3d.width, skyEndY)

		this.ctx.fillStyle = `rgb(15, 35, 15)`
		this.ctx.fillRect(0, skyEndY, world3d.width, world3d.height - skyEndY)
	}

	draw(rayLengths, rayXvalues, rayYvalues, spriteRays, cornerRays) {
		this.rayNum = rayLengths.length
		this.spriteNum = spriteRays.length
		this.wallWidth = this.world3d.width / this.rayNum
		this.wallWidthOversized = this.wallWidth + 1
		this.spriteWidthOversized = this.wallWidth + 12
		let wallX = 0
		// let cornerPoint = null;

		this.drawBackground()

		for (let i = 0; i < this.rayNum; i++) {
			const rayLength = rayLengths[i]

			// const fovRad = this.fov * (Math.PI / 180);
			// const wallShiftAmt = this.worldHalfHeight / 4;
			const wallShiftAmt = (this.world3d.height * 50) / rayLength
			let wallCenterHeight = this.wallCenterHeightOriginal

			if (this.isJumping) {
				wallCenterHeight = this.jump(rayLength, wallCenterHeight, i)
			}

			const wallStartTop = wallCenterHeight - wallShiftAmt
			const wallEndBottom = wallCenterHeight + wallShiftAmt
			// const wallHeight = wallEndBottom - wallStartTop;

			let wallDarkness = rayLength / this.world3d.height
			wallDarkness = (this.world3dDiag - rayLength) / this.world3dDiag

			const wallGradient = this.ctx.createLinearGradient(
				wallX + this.wallWidthOversized / 2,
				wallEndBottom,
				wallX + this.wallWidthOversized / 2,
				wallStartTop
			)
			wallGradient.addColorStop(0, `rgba(${75 * wallDarkness},${75 * wallDarkness},${75 * wallDarkness},1)`)
			wallGradient.addColorStop(
				1,
				`rgba(${255 * wallDarkness},${255 * wallDarkness},${255 * wallDarkness},1)`
			)

			// const chunkSize = 64
			// const chunkPosX =
			// 	rayXvalues[i] === chunkSize ? chunkSize : ((rayXvalues[i] % chunkSize) + chunkSize) % chunkSize

			// function getSwidth() {
			// 	let chunkPosX2 = 0
			// 	if (rayXvalues[i + 1]) {
			// 		chunkPosX2 =
			// 			rayXvalues[i + 1] === chunkSize
			// 				? chunkSize
			// 				: ((rayXvalues[i + 1] % chunkSize) + chunkSize) % chunkSize
			// 	} else {
			// 		chunkPosX2 =
			// 			rayXvalues[i - 1] === chunkSize
			// 				? chunkSize
			// 				: ((rayXvalues[i - 1] % chunkSize) + chunkSize) % chunkSize
			// 	}
			// 	return Math.abs(chunkPosX2 - chunkPosX)
			// }

			// const chunkPosX2 =
			// 	rayXvalues[i + 1] === chunkSize
			// 		? chunkSize
			// 		: ((rayXvalues[i + 1] % chunkSize) + chunkSize) % chunkSize

			// const sWidth =
			// 	i > 0 ? Math.abs(rayXvalues[i] - rayXvalues[i - 1]) : Math.abs(rayXvalues[i] - rayXvalues[i + 1])

			// const sHeight = sWidth * (this.mapPixelH / this.mapPixelW)

			// this.ctx.drawImage(
			// 	this.wallTexture,
			// 	chunkPosX,
			// 	0,
			// 	getSwidth(),
			// 	this.wallTexture.height,
			// 	wallX,
			// 	wallStartTop,
			// 	this.wallWidthOversized,
			// 	wallEndBottom - wallStartTop
			// )

			// this.ctx.fillStyle = `rgba(0, 0, 0, ${(1 - wallDarkness) * 2})`
			this.ctx.fillStyle = wallGradient
			this.ctx.fillRect(wallX, wallStartTop, this.wallWidthOversized, wallEndBottom - wallStartTop)

			wallDarkness = wallDarkness + 0.5

			const cornerGradient = this.ctx.createLinearGradient(wallX, wallStartTop, wallX, wallEndBottom)
			cornerGradient.addColorStop(0, `rgba(${50 * wallDarkness},${50 * wallDarkness},${50 * wallDarkness},1)`)
			cornerGradient.addColorStop(1, `rgba(${0 * wallDarkness},${0 * wallDarkness},${0 * wallDarkness},1)`)

			// this.ctx.fillStyle = 'rgba(0, 150, 255, 1)';
			// this.ctx.fillStyle = 'rgba(0, 150, 255, 1)';
			// this.ctx.fillRect(wallX, wallStartTop, this.wallWidthOversized, 3);
			// this.ctx.fillRect(wallX, wallEndBottom, this.wallWidthOversized, 3);

			// for (const lengthToCorner of cornerRays) {
			// 	if (lengthToCorner === rayLength) {
			// 		this.ctx.lineWidth = 1
			// 		// this.ctx.strokeStyle = cornerGradient;
			// 		this.ctx.beginPath()
			// 		this.ctx.moveTo(wallX, wallStartTop)
			// 		this.ctx.lineTo(wallX, wallEndBottom)
			// 		this.ctx.stroke()
			// 	}
			// }

			for (const cornerRay of cornerRays) {
				if (Math.abs(cornerRay - rayLength) < 0.0001) {
					// this.ctx.fillStyle = cornerGradient;
					// this.ctx.fillRect(wallX, wallStartTop, this.wallWidthOversized, wallEndBottom - wallStartTop);
					this.ctx.lineWidth = 3
					this.ctx.strokeStyle = cornerGradient
					this.ctx.beginPath()
					this.ctx.moveTo(wallX + this.wallWidthOversized / 2, wallStartTop)
					this.ctx.lineTo(wallX + this.wallWidthOversized / 2, wallEndBottom)
					this.ctx.stroke()
				}
			}

			wallX += this.wallWidth
		}

		for (let i = 0; i < spriteRays.length; i++) {
			const rayLength = spriteRays[i].rayLength
			const percAcrScreen = spriteRays[i].percAcrScreen
			const spriteX = this.world3d.width * percAcrScreen - this.wallWidthOversized / 2

			const wallShiftAmt = (this.world3d.height * 50) / rayLength / 4.5
			let wallCenterHeight = this.wallCenterHeightOriginal + wallShiftAmt * 2

			if (this.isJumping) {
				wallCenterHeight = this.jump(rayLength, wallCenterHeight, i + rayLength)
			}

			const wallStartTop = wallCenterHeight - wallShiftAmt
			const wallEndBottom = wallCenterHeight + wallShiftAmt

			let wallDarkness = (this.world3dDiag - rayLength) / this.world3dDiag

			const wallGradient = this.ctx.createLinearGradient(
				spriteX + this.spriteWidthOversized / 2,
				wallEndBottom,
				spriteX + this.spriteWidthOversized / 2,
				wallStartTop
			)
			wallGradient.addColorStop(0, `rgba(${205 * wallDarkness},${190 * wallDarkness},${26 * wallDarkness},1)`)
			wallGradient.addColorStop(1, `rgba(${245 * wallDarkness},${230 * wallDarkness},${66 * wallDarkness},1)`)

			this.ctx.fillStyle = wallGradient
			this.ctx.fillRect(spriteX, wallStartTop, this.spriteWidthOversized, wallEndBottom - wallStartTop)
		}
	}
}
