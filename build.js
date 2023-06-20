export default class Build {
    constructor(worldCreation, world) {
        this.worldCreation = worldCreation;
        this.world = world;
        this.ctx = this.worldCreation.getContext('2d');
        this.lineActive = false;
        this.walls = [];
        this.sprites = [];
        this.p1 = {};
        this.mousePos= {};
        this.allPoints = [];
        this.pointColor = 'rgba(255,0,0,1)';
        this.actualCanvasWidth = 1920;
        this.actualCanvasHeight = 1200;
        this.addingSprite = false;
    }

    setSprites(sprites) {
        this.sprites = sprites;
    }

    getSprites() {
        return [...this.sprites];
    }
    
    setAddingSprite(addingSprite) {
        this.addingSprite = addingSprite;
    }

    getAddingSprite() {
        return this.addingSprite;
    }

    addSpritePoint() {
       this.sprites.push({
            x1: this.mousePos.x,
            y1: this.mousePos.y - 5,
            x2: this.mousePos.x,
            y2: this.mousePos.y + 5
       }) 
    }

    clearCurLines() {
        this.p1 = {};
        this.mousePos = {};
    }

    getWalls() {
        if (!this.walls[0]) {
            this.addEdgeWalls();
        }

        return [...this.walls];
    }

    setWalls(walls) {
        this.allPoints = [];
        this.p1 = {};
        this.mousePos = {};
        this.walls = walls;
        for (let wall of this.walls) {
            this.allPoints.push({x: wall.x1, y: wall.y1})
            this.allPoints.push({x: wall.x2, y: wall.y2})
        }
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
        this.allPoints = [];
        this.p1 = {};
        this.mousePos = {};
    }

    removeLastWall() {
        if (this.p1?.x) return
        this.walls.pop();
        this.allPoints.pop();
        this.allPoints.pop();
    }

    setMousePos(canvasPosX, canvasPosY) {
        if (this.p1?.x || this.addingSprite) {
            const actualToDisplayedRatioX = this.actualCanvasWidth/this.worldCreation.getBoundingClientRect().width;
            const actualToDisplayedRatioY = this.actualCanvasHeight/this.worldCreation.getBoundingClientRect().height;
            this.mousePos.x = canvasPosX * actualToDisplayedRatioX;
            this.mousePos.y = canvasPosY * actualToDisplayedRatioY;
        }
    }

    addPoint(canvasPosX, canvasPosY) {
        if (!this.walls[0]) this.addEdgeWalls();

        const actualToDisplayedRatioX = this.actualCanvasWidth/this.worldCreation.getBoundingClientRect().width;
        const actualToDisplayedRatioY = this.actualCanvasHeight/this.worldCreation.getBoundingClientRect().height;
        let x = canvasPosX * actualToDisplayedRatioX;
        let y = canvasPosY * actualToDisplayedRatioY;
        
        for (let i=0; i<this.allPoints.length; i++) {
            if (this.p1?.x && Math.abs(x - this.p1.x) <= 15 && Math.abs(y - this.p1.y) <= 15) {
                this.p1 = {};
                return;
            }

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

    handleWorldClick(canvasPosX, canvasPosY) {
        if (this.addingSprite) {
            this.addSpritePoint(canvasPosX, canvasPosY);
        } else {
            this.addPoint(canvasPosX, canvasPosY);
        }
    }

    draw() {
        for (let walls of this.walls) {
            this.ctx.beginPath();
            this.ctx.moveTo(walls.x1, walls.y1);
            this.ctx.lineTo(walls.x2, walls.y2);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
            this.ctx.stroke();
        }

        for (let sprite of this.sprites) {
            this.ctx.beginPath();
            this.ctx.moveTo(sprite.x1, sprite.y1);
            this.ctx.lineTo(sprite.x2, sprite.y2);
            this.ctx.lineWidth = 6;
            this.ctx.strokeStyle = "rgba(245,230,66,0.8)";
            this.ctx.stroke();
        }

        if (this.p1?.x) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.p1.x, this.p1.y);
            this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
            this.ctx.stroke();
        }

        if (this.addingSprite) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.mousePos.x, this.mousePos.y + 5);
            this.ctx.lineTo(this.mousePos.x, this.mousePos.y - 5);
            this.ctx.lineWidth = 6;
            this.ctx.strokeStyle = "rgba(245,230,66,0.8)";
            this.ctx.stroke();
        }
    }
}