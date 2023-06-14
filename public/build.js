export default class Build {
    constructor(worldCreation, world) {
        this.worldCreation = worldCreation;
        this.world = world;
        this.ctx = this.worldCreation.getContext('2d');
        this.lineActive = false;
        this.allWalls = [];
        this.p1 = {};
        this.p2Temp = {};
        this.allPoints = [];
        this.pointColor = 'rgba(255,0,0,1)';
    }

    getWalls() {
        this.allWalls.push(
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

        return this.allWalls;
    }

    setP2Temp(x, y) {
        if (this.p1?.x) this.p2Temp = {x, y}
    }

    addPoint(canvasPosX, canvasPosY) {
        let x = canvasPosX;
        let y = canvasPosY;
        
        for (let i=0; i<this.allPoints.length; i++) {
            if (Math.abs(x - this.allPoints[i].x) <= 15 && Math.abs(y - this.allPoints[i].y) <= 15) {
                x = this.allPoints[i].x;
                y = this.allPoints[i].y;
                break;
            }
        }
        
        if (!this.p1?.x) {
            // this.ctx.beginPath();
            // this.ctx.fillStyle = this.pointColor;
            // this.ctx.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI);
            // this.ctx.fill();
            this.p1 = {x, y};
        } else {
            // this.ctx.beginPath();
            // this.ctx.fillStyle = this.pointColor;
            // this.ctx.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI);
            // this.ctx.fill();

            // this.ctx.beginPath();
            // this.ctx.moveTo(this.p1.x, this.p1.y);
            // this.ctx.lineTo(x, y);
            // this.ctx.lineWidth = 2;
            // this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
            // this.ctx.stroke();
            
            this.allWalls.push({
                x1: this.p1.x,
                y1: this.p1.y,
                x2: x,
                y2: y
            })
            
            this.p1 = {};
        }
        
        this.allPoints.push({x, y})
    }

    draw() {
        for (let point of this.allWalls) {
            this.ctx.beginPath();
            this.ctx.moveTo(point.x1, point.y1);
            this.ctx.lineTo(point.x2, point.y2);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
            this.ctx.stroke();
        }

        if (this.p1?.x) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.p1.x, this.p1.y);
            this.ctx.lineTo(this.p2Temp.x, this.p2Temp.y);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
            this.ctx.stroke();
        }
    }
}