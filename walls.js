export default class Walls {
    constructor(world, wallNum) {
        this.world = world;
        this.lines = [];
        this.wallNum = wallNum;
        this.minWallWidth = 10;
        this.maxWallWidth = 30
    }

    build = () => {
        for (let i = 0; i < this.wallNum; i++) {
            let x1, y1, x2, y2;
            let firstX1, firstY1;
            for (let j = 0; j < 4; j++) {
                if (j === 0) {
                    x1 = firstX1 = Math.floor(Math.random() * (this.world.width - this.maxWallWidth));
                    y1 = firstY1 = Math.floor(Math.random() * (this.world.height - this.maxWallWidth));
                    x2 = Math.floor(Math.random() * (this.world.width - this.maxWallWidth));
                    y2 = Math.floor(Math.random() * (this.world.height - this.maxWallWidth));   
                } else if (j === 1) {
                    x1 = x2;
                    y1 = y2;
                    x2 = x1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
                    y2 = y1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
                } else if (j === 2) {
                    x1 = x2;
                    y1 = y2;
                    x2 = firstX1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
                    y2 = firstY1 + Math.floor(Math.random() * (this.maxWallWidth - this.minWallWidth) + this.minWallWidth);
                } else if (j === 3) {
                    x1 = x2;
                    y1 = y2;
                    x2 = firstX1;
                    y2 = firstY1;
                }

                this.lines.push({
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2
                })
            }
        }

        this.lines.push(
            {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: this.world.height
            },
            {
                x1: 0,
                y1: 0,
                x2: this.world.width,
                y2: 0
            },
            {
                x1: this.world.width,
                y1: 0,
                x2: this.world.width,
                y2: this.world.height
            },
            {
                x1: this.world.width,
                y1: this.world.height,
                x2: 0,
                y2: this.world.height
            }
        )

        return this.lines;
    }

    draw() {
        const ctx = this.world.getContext('2d');

        for (const line of this.lines) {;
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FFFFFF";
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    }
}