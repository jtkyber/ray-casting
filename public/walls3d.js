export default class Walls3d {
    constructor(world3d, fov) {
        this.world3d = world3d;
        this.fov = fov;
        this.ctx = world3d.getContext('2d');
        this.world3dDiag = Math.sqrt(Math.pow(world3d.width, 2) + Math.pow(world3d.height, 2));
        this.wallTexture = new Image();
        this.wallTexture.src = './wallTexture.jpg';
        // this.wallTexturePattern = this.ctx.createPattern(this.wallTexture, 'repeat');
    }

    draw(walls) {
        this.ctx.clearRect(0, 0, this.world3d.width, this.world3d.height);
        const rayNum = walls.length;
        let wallX = 0;
        for (const wall of walls) {
            let wallWidth = this.world3d.width / rayNum;
            const wallWidthOversized = wallWidth + 1;

            const fovRad = this.fov * (Math.PI / 180);
            // const wallHeight = wall * Math.cos(fovRad);
            let wallStartTop = (this.world3d.height / 2) + 10000 / wall;
            let wallDarkness = wall / this.world3d.height;
            wallDarkness = ((this.world3dDiag - wall) / this.world3dDiag);

            const wallGradient = this.ctx.createLinearGradient(wallX + wallWidthOversized / 2, wallStartTop, wallX + wallWidthOversized / 2, this.world3d.height - wallStartTop * 2.3);
            wallGradient.addColorStop(0, `rgba(${75 * wallDarkness},${75 * wallDarkness},${75 * wallDarkness},1)`);
            wallGradient.addColorStop(0.5, `rgba(${255 * wallDarkness},${255 * wallDarkness},${255 * wallDarkness},1)`);
            wallGradient.addColorStop(1, `rgba(${255 * wallDarkness},${255 * wallDarkness},${255 * wallDarkness},1)`);

            // this.ctx.beginPath();
            // this.ctx.fillStyle = `rgba(${186 * wallDarkness},${200 * wallDarkness},${255 * wallDarkness},1)`;
            this.ctx.fillStyle = wallGradient;
            this.ctx.fillRect(wallX, wallStartTop, wallWidthOversized, this.world3d.height - wallStartTop * 2.3);
            // this.ctx.rect(wallX, wallStartTop, wallWidth + 1, this.world3d.height - wallStartTop * 2.3);
            // this.ctx.fill();

            // this.ctx.drawImage(this.wallTexture, wallX, wallStartTop, wallWidth + 1, this.world3d.height - wallStartTop * 2.3)
            // this.ctx.fillStyle = `rgba(0,0,0,${wallDarkness})`;
            // this.ctx.fillRect(wallX, wallStartTop, wallWidth + 1, this.world3d.height - wallStartTop * 2.3);

            wallX += wallWidth;
        }
    }
}
