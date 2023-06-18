export default class Build {
    constructor(worldCreation, world) {
        this.worldCreation = worldCreation;
        this.world = world;
        this.ctx = this.worldCreation.getContext('2d');
        this.lineActive = false;
        this.walls = [];
        this.p1 = {};
        this.p2Temp = {};
        this.allPoints = [];
        this.pointColor = 'rgba(255,0,0,1)';
        this.actualCanvasWidth = 1920;
        this.actualCanvasHeight = 1200;
    }

    setWalls(walls) {
        this.walls = walls;
    }

    getWalls() {
        if (!this.walls[0]) {
            this.addEdgeWalls();
        }

        return [...this.walls];
    }

    addEdgeWalls() {
        this.walls.push(
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
    }

    clearWalls() {
        this.walls = [];
    }

    removeLastWall() {
        this.walls.pop();
    }

    loadSavedWalls(savedWalls) {
        this.walls = savedWalls;
    }

    setP2Temp(x, y) {
        if (this.p1?.x) this.p2Temp = {x, y}
    }

    addPoint(canvasPosX, canvasPosY) {
        if (!this.walls[0]) this.addEdgeWalls();

        const actualToDisplayedRatioX = this.actualCanvasWidth/this.worldCreation.getBoundingClientRect().width;
        const actualToDisplayedRatioY = this.actualCanvasHeight/this.worldCreation.getBoundingClientRect().height;
        let x = canvasPosX * actualToDisplayedRatioX;
        let y = canvasPosY * actualToDisplayedRatioY;
        
        for (let i=0; i<this.allPoints.length; i++) {
            if (Math.abs(x - this.allPoints[i].x) <= 15 && Math.abs(y - this.allPoints[i].y) <= 15) {
                x = this.allPoints[i].x;
                y = this.allPoints[i].y;
                break;
            }
        }
        
        if (!this.p1?.x) {
            this.p1 = {x, y};
        } else {
            this.walls.push({
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
        for (let point of this.walls) {
            this.ctx.beginPath();
            this.ctx.moveTo(point.x1, point.y1);
            this.ctx.lineTo(point.x2, point.y2);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
            this.ctx.stroke();
        }

        if (this.p1?.x) {
            const actualToDisplayedRatioX = this.actualCanvasWidth/this.worldCreation.getBoundingClientRect().width;
            const actualToDisplayedRatioY = this.actualCanvasHeight/this.worldCreation.getBoundingClientRect().height;
            let x = this.p2Temp.x * actualToDisplayedRatioX;
            let y = this.p2Temp.y * actualToDisplayedRatioY;

            this.ctx.beginPath();
            this.ctx.moveTo(this.p1.x, this.p1.y);
            this.ctx.lineTo(x, y);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
            this.ctx.stroke();
        }
    }
}