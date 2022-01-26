export default class Walls {
    constructor(world, wallNum) {
        this.world = world;
        this.lines = [];
        this.corners = [];
        this.wallNum = wallNum;
        this.minWallWidth = 10;
        this.maxWallWidth = 30
    }

    pointIsBetween(x1, y1, x2, y2, px, py) {
        return ((px > Math.min(x1, x2)) && (px < Math.max(x1, x2)) && (py > Math.min(y1, y2)) && (py < Math.max(y1, y2)));
    }

    getIntersection = (x1, y1, x2, y2) => {
        for (const line of this.lines) {
            const x3 = line.x1;
            const y3 = line.y1;
            const x4 = line.x2;
            const y4 = line.y2;
            if ((x1 === x3 && y1 === y3) || (x1 === x4 && y1 === y4)) {
                this.corners.push({
                    x: x1,
                    y: y1
                })
            } else if ((x2 === x3 && y2 === y3) || (x2 === x4 && y2 === y4)) {
                this.corners.push({
                    x: x2,
                    y: y2
                })
            } else if ((x1 !== x3) && (y1 !== y3) && (x2 !== x4) && (y2 !== y4)) {
                const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                if (denom !== 0) {
                    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
                    const u  = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denom;

                    if (t > 0 && t < 1 && u > 0) {
                        const px = x3 + u * (x4 - x3);
                        const py = y3 + u * (y4 - y3);

                        if (this.pointIsBetween(x1, y1, x2, y2, px, py) && this.pointIsBetween(x3, y3, x4, y4, px, py)) {
                            this.corners.push({
                                x: px,
                                y: py
                            })
                        }
                    }
                }
            }
        }
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

        for (const line of this.lines) {
            this.getIntersection(line.x1, line.y1, line.x2, line.y2);
        }

        return [this.lines, this.corners];
    }

    draw() {
        const ctx = this.world.getContext('2d');

        for (const line of this.lines) {;
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            ctx.stroke();
        }

        for (const corner of this.corners) {;
            ctx.beginPath();
            ctx.fillStyle = "rgba(255,0,0,1)";
            ctx.ellipse(corner.x, corner.y, 2, 2, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}