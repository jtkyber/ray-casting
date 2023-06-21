export default class Walls3d {
    constructor(world3d, fov) {
        this.world3d = world3d;
        this.fov = fov;
        this.ctx = world3d.getContext('2d');
        this.world3dDiag = Math.sqrt(Math.pow(world3d.width, 2) + Math.pow(world3d.height, 2));
        this.wallTexture = new Image();
        this.wallTexture.src = './wallTexture.jpg';
        this.worldHalfHeight = world3d.height / 2;
        this.wallCenterHeightOriginal = this.world3d.height / 2.5;
        this.jumpStep = 6;
        this.jumpIterations = 0;
        this.isJumping = false;
        this.rayNum = 0;
        this.spriteNum = 0;
    }

    setJumping(isJumping) {
        this.isJumping = isJumping;
    }

    jump(ray, wallCenterHeight, rayIndex) {
        if (rayIndex === 0) {
            this.jumpStep -= 0.2;
            this.jumpIterations += 1;
        } 
        
        const jumpOffset = this.world3d.height / ray;

        if (this.jumpStep > 0) {
            return wallCenterHeight += this.jumpStep * this.jumpIterations * jumpOffset;
        } else if (wallCenterHeight > this.wallCenterHeightOriginal) {
            return wallCenterHeight += this.jumpStep * this.jumpIterations * jumpOffset;
        } else if (wallCenterHeight <= this.wallCenterHeightOriginal) {
            this.jumpStep = 6;
            this.isJumping = false;
            this.jumpIterations = 0;
        } 
        return wallCenterHeight;
    }

    draw(rays, spriteRays, cornerRays) {
        this.rayNum = rays.length;
        this.spriteNum = spriteRays.length;
        const wallWidth = this.world3d.width / rays.length;
        const wallWidthOversized = wallWidth + 1;
        // const spriteWidth = this.world3d.width / spriteRayNum;
        const spriteWidthOversized = wallWidth + 12;
        let wallX = 0;
        // let cornerPoint = null;
        for (let i=0; i<rays.length; i++) {
            const ray = rays[i];

            // const fovRad = this.fov * (Math.PI / 180);
            // const wallShiftAmt = this.worldHalfHeight / 4;
            const wallShiftAmt = (this.world3d.height * 50) / ray;
            let wallCenterHeight = this.wallCenterHeightOriginal;

            if (this.isJumping) {
                wallCenterHeight = this.jump(ray, wallCenterHeight, i);
            }
            
            const wallStartTop = wallCenterHeight - wallShiftAmt;
            const wallEndBottom = wallCenterHeight + wallShiftAmt;
            // const wallHeight = wallEndBottom - wallStartTop;


            let wallDarkness = ray / this.world3d.height;
            wallDarkness = ((this.world3dDiag - ray) / this.world3dDiag);

            const wallGradient = this.ctx.createLinearGradient(wallX + wallWidthOversized / 2, wallEndBottom, wallX + wallWidthOversized / 2, wallStartTop);
            wallGradient.addColorStop(0, `rgba(${75 * wallDarkness},${75 * wallDarkness},${75 * wallDarkness},1)`);
            wallGradient.addColorStop(1, `rgba(${255 * wallDarkness},${255 * wallDarkness},${255 * wallDarkness},1)`);
            
            this.ctx.fillStyle = wallGradient;
            this.ctx.fillRect(wallX, wallStartTop, wallWidthOversized, wallEndBottom - wallStartTop);

            wallDarkness = wallDarkness + 0.5;

            const cornerGradient = this.ctx.createLinearGradient(wallX, wallStartTop, wallX, wallEndBottom);
            cornerGradient.addColorStop(0, `rgba(${50 * wallDarkness},${50 * wallDarkness},${50 * wallDarkness},1)`);
            cornerGradient.addColorStop(1, `rgba(${0 * wallDarkness},${0 * wallDarkness},${0 * wallDarkness},1)`);

            // this.ctx.fillStyle = 'rgba(0, 150, 255, 1)';
            // this.ctx.fillStyle = 'rgba(0, 150, 255, 1)';
            // this.ctx.fillRect(wallX, wallStartTop, wallWidthOversized, 3);
            // this.ctx.fillRect(wallX, wallEndBottom, wallWidthOversized, 3);

            // for (const lengthToCorner of cornerRays) {
            //     if (lengthToCorner === ray) {
            //         this.ctx.lineWidth = 1;
            //         // this.ctx.strokeStyle = cornerGradient;
            //         this.ctx.beginPath();
            //         this.ctx.moveTo(wallX, wallStartTop);
            //         this.ctx.lineTo(wallX, wallEndBottom);
            //         this.ctx.stroke();
            //     }
            // }

            for (const cornerRay of cornerRays) {
                if (cornerRay === ray) { 
                    // this.ctx.fillStyle = cornerGradient;
                    // this.ctx.fillRect(wallX, wallStartTop, wallWidthOversized, wallEndBottom - wallStartTop);
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeStyle = cornerGradient;
                    this.ctx.beginPath();
                    this.ctx.moveTo(wallX + wallWidthOversized/2, wallStartTop);
                    this.ctx.lineTo(wallX + wallWidthOversized/2, wallEndBottom);
                    this.ctx.stroke();
                }
            }
            
            wallX += wallWidth;
        }

        for (let i=0; i<spriteRays.length; i++) {
            const rayLength = spriteRays[i].rayLength;
            const percAcrScreen = spriteRays[i].percAcrScreen;
            const spriteX = this.world3d.width * percAcrScreen;

            const wallShiftAmt = (this.world3d.height * 50) / rayLength / 4;
            let wallCenterHeight = this.wallCenterHeightOriginal;

            if (this.isJumping) {
                wallCenterHeight = this.jump(rayLength, wallCenterHeight, i + rays.length);
            }
            
            const wallStartTop = wallCenterHeight - wallShiftAmt;
            const wallEndBottom = wallCenterHeight + wallShiftAmt;

            let wallDarkness = ((this.world3dDiag - rayLength) / this.world3dDiag);

            const wallGradient = this.ctx.createLinearGradient(spriteX + spriteWidthOversized / 2, wallEndBottom, spriteX + spriteWidthOversized / 2, wallStartTop);
            wallGradient.addColorStop(0, `rgba(${205 * wallDarkness},${190 * wallDarkness},${26 * wallDarkness},1)`);
            wallGradient.addColorStop(1, `rgba(${245 * wallDarkness},${230 * wallDarkness},${66 * wallDarkness},1)`);
            
            this.ctx.fillStyle = wallGradient;
            this.ctx.fillRect(spriteX, wallStartTop, spriteWidthOversized, wallEndBottom - wallStartTop);
        }
    }
}
