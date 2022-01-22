export default class Walls3d {
    constructor(world3d, fov) {
        this.world3d = world3d;
        this.fov = fov;
        this.ctx = world3d.getContext('2d');
        this.useRawDistance = false;
        this.world3dDiag = Math.sqrt(Math.pow(world3d.width, 2) + Math.pow(world3d.height, 2));

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.useRawDistance = true;
            }
        })
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.useRawDistance = false;
            }
        })
    }

    draw(walls) {
        this.ctx.clearRect(0, 0, this.world3d.width, this.world3d.height);
        const rayNum = walls.length;
        const wallWidth = Math.ceil(this.world3d.width / rayNum);
        let wallX = 0;

        for (const wall of walls) {
            const fovRad = (this.fov) * (Math.PI / 180);
            let wallHeight = wall;
            if (!this.useRawDistance) {
                wallHeight = wall * Math.cos(fovRad);
            }
            let wallStartTop = wallHeight / 3 - 30;
            const wallOpacity = ((this.world3d.height - wall) / this.world3d.height);

            this.ctx.beginPath();
            // this.ctx.strokeStyle = `rgba(0,0,0,1)`;
            this.ctx.fillStyle = `rgba(${186 * wallOpacity},${200 * wallOpacity},${255 * wallOpacity},1)`;
            this.ctx.rect(wallX, wallStartTop, wallWidth, this.world3d.height - wallStartTop * 2);
            // this.ctx.stroke();
            this.ctx.fill();
            wallX += wallWidth;
        }
    }
}
