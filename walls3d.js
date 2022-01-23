export default class Walls3d {
    constructor(world3d, fov, angle) {
        this.world3d = world3d;
        this.fov = fov;
        this.ctx = world3d.getContext('2d');
        this.world3dDiag = Math.sqrt(Math.pow(world3d.width, 2) + Math.pow(world3d.height, 2));
    }

    draw(walls) {
        this.ctx.clearRect(0, 0, this.world3d.width, this.world3d.height);
        const rayNum = walls.length;
        // const wallWidth = this.world3d.width / rayNum;
        // const wallWidthDec = '.' + parseFloat(this.world3d.width / rayNum).toString().split('.')[1];
        // const wallShift = (wallWidthDec * rayNum) / 2;
        let wallX = 0;

        // this.ctx.moveTo(wallShift, 0);

        for (const wall of walls) {
            let wallWidth = this.world3d.width / rayNum;

            const fovRad = this.fov * (Math.PI / 180);
            const wallHeight = wall * Math.cos(fovRad);
            // let wallStartTop = wallHeight / 3 - 30;
            const wallStartTop = (this.world3d.height / 2) + 10000 / wall;
            const wallOpacity = ((this.world3d.height - wall) / this.world3d.height);
            // wallWidth = (this.world3d.height - wallHeight * 2) / 20;

            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(${186 * wallOpacity},${200 * wallOpacity},${255 * wallOpacity},1)`;
            this.ctx.fillStyle = `rgba(${186 * wallOpacity},${200 * wallOpacity},${255 * wallOpacity},1)`;
            this.ctx.rect(wallX, wallStartTop, wallWidth, this.world3d.height - wallStartTop * 2.3);
            this.ctx.stroke();
            this.ctx.fill();
            wallX += wallWidth;
        }
    }
}
