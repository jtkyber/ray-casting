export default class Walls3d {
    constructor(world3d, fov) {
        this.world3d = world3d;
        this.fov = fov;
        this.ctx = world3d.getContext('2d');
        this.world3dDiag = Math.sqrt(Math.pow(world3d.width, 2) + Math.pow(world3d.height, 2));
        this.wallTexture = new Image();
        this.wallTexture.src = './wallTexture.jpg';
        this.worldHalfHeight = world3d.height / 2;
        // this.wallTexturePattern = this.ctx.createPattern(this.wallTexture, 'repeat');
    }

    draw(rays, lengthsToCorner) {
        const rayNum = rays.length;
        let wallX = 0;
        // let cornerPoint = null;
        
        for (const ray of rays) {
            let wallWidth = this.world3d.width / rayNum;
            const wallWidthOversized = wallWidth + 1;

            const fovRad = this.fov * (Math.PI / 180);
            const wallShiftAmt = (this.worldHalfHeight) / 4;
            const wallStartTop = ((this.worldHalfHeight) - (this.world3d.height * 50) / ray) - wallShiftAmt;
            const wallEndBottom = this.world3d.height - wallStartTop - wallShiftAmt;

            let wallDarkness = ray / this.world3d.height;
            wallDarkness = ((this.world3dDiag - ray) / this.world3dDiag);

            const wallGradient = this.ctx.createLinearGradient(wallX + wallWidthOversized / 2, wallEndBottom, wallX + wallWidthOversized / 2, wallStartTop);
            wallGradient.addColorStop(0, `rgba(${75 * wallDarkness},${75 * wallDarkness},${75 * wallDarkness},1)`);
            wallGradient.addColorStop(1, `rgba(${255 * wallDarkness},${255 * wallDarkness},${255 * wallDarkness},1)`);

            // const cornerGradient = this.ctx.createLinearGradient(wallX, wallStartTop, wallX, wallEndBottom);
            // cornerGradient.addColorStop(0, `rgba(${50 * wallDarkness},${50 * wallDarkness},${50 * wallDarkness},1)`);
            // cornerGradient.addColorStop(1, `rgba(${0 * wallDarkness},${0 * wallDarkness},${0 * wallDarkness},1)`);
            
            this.ctx.fillStyle = wallGradient;
            this.ctx.fillRect(wallX, wallStartTop, wallWidthOversized, wallEndBottom - wallStartTop);

            this.ctx.fillStyle = 'rgba(0, 150, 255, 1)';
            this.ctx.fillRect(wallX, wallStartTop, wallWidthOversized, 2);
            this.ctx.fillRect(wallX, wallEndBottom, wallWidthOversized, 1);

            // for (const lengthToCorner of lengthsToCorner) {
            //     if (lengthToCorner === ray) {
            //         this.ctx.lineWidth = 1;
            //         // this.ctx.strokeStyle = cornerGradient;
            //         this.ctx.beginPath();
            //         this.ctx.moveTo(wallX, wallStartTop);
            //         this.ctx.lineTo(wallX, wallEndBottom);
            //         this.ctx.stroke();
            //     }
            // }

            wallX += wallWidth;
        }
    }
}
