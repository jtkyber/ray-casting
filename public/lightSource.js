import Walls3d from "./walls3d.js";

export default class LightSource {
    constructor(world, world3d, allWalls, allCorners, walls3d) {
        this.world = world;
        this.world3d = world3d;
        this.allWalls = allWalls;
        this.allCorners = allCorners;
        this.cornersInView = [];
        this.allRays = [];
        this.allSpriteRays = [];
        this.moveDirRays = {
            foreward: Infinity,
            left: Infinity,
            right: Infinity,
            backward: Infinity
        };
        this.rayIncrement = 0.2;
        this.rayOpacity = 0.26;
        this.fov = 45;
        this.rotation = 45;
        this.playerX = 5;
        this.playerY = 5;
        this.moveAmtStart = 0.5;
        this.moveAmt = this.moveAmtStart;
        this.moveAmtTop = 1.5;
        this.angle = this.rotation + 90;
        this.rotationAmtStart = 0.2;
        this.rotationAmt = this.rotationAmtStart;
        this.rotationAmtTop = 2
        this.moveDirFB = null;
        this.moveDirLR = null;
        this.moveDirStrafe = null;
        this.walls3d = walls3d;
        this.flashlight = document.querySelector('.flashlight');
        this.fovRad = this.fov * (Math.PI / 180);
        this.distToProjectionPlane = (world3d.width / 2) / Math.tan(this.fovRad / 2);
        this.rayAngles = [];
        this.rayDensityAdjustment = 12;
        this.fullscreen = false;
        this.sprites = [{
            x1: 20,
            y1: 20,
            x2: 20,
            y2: 30
        }]
    }

    setFullscreen(isFS) {
        this.fullscreen = isFS;
    }

    getMoveDirLR() {
        return this.moveDirLR;
    }

    setWalls(walls) {
        this.allWalls = walls;
    }

    setCorners(corners) {
        this.allCorners = corners;
    }

    setAngles() {
        this.rayAngles = [];
        this.distToProjectionPlane = (world3d.width / 2) / Math.tan(this.fovRad / 2);
        for (let x = 0; x < this.world3d.width + this.rayDensityAdjustment; x += this.rayDensityAdjustment) {
            this.rayAngles.push(Math.atan((x - this.world3d.width / 2) / this.distToProjectionPlane));
        }
    }

    setPlayerPos(playerX, playerY) {
        this.playerX = playerX;
        this.playerY = playerY;
    }

    getPlayerPos() {
        return [this.playerX, this.playerY]
    }

    setFov(value) {
        this.fov = value;
        this.fovRad = this.fov * (Math.PI / 180);
        this.setAngles();
        localStorage.setItem('fov', JSON.stringify(value));
    }

    setRayDensity(value) {
        this.rayDensityAdjustment = value;
        this.rayOpacity = value / 100 + 0.14; 
        this.setAngles();
        localStorage.setItem('rayDensity', JSON.stringify(value));
    }

    setRotationValue(rot) {
        this.rotation = rot;
        this.angle = rot + 90;
    }

    getRotationValue() {
        return this.rotation;
    }

    setRotation(dir) {
        if (this.moveDirLR === null) {
            this.rotationAmt = this.rotationAmtStart;
        }
        this.moveDirLR = dir;
    }

    setMouseRotation(amt) {
        // if (Math.abs(amt) > 5) {
        //     console.log(Math.abs(amt), this.rotation)
        // }
        this.rotation += amt;
        this.angle += amt;
    }

    rotate() {
        if (this.rotationAmt < this.rotationAmtTop) {
            this.rotationAmt += .1;
        }

        if (this.moveDirLR === 'left') {
            this.rotation -= this.rotationAmt;
            this.angle -= this.rotationAmt;
        } else if (this.moveDirLR === 'right') {
            this.rotation += this.rotationAmt;
            this.angle += this.rotationAmt;
        }
    }

    
    setMoveDir(dir) {
        if (this.moveDirFB === null) {
            this.moveAmt = this.moveAmtStart;
        }
        this.moveDirFB = dir;
    }

    setStrafeDir(dir) {
        if (this.moveDirStrafe === null) {
            this.moveAmt = this.moveAmtStart;
        }
        this.moveDirStrafe = dir;
    }

    move() {
        if ((this.moveAmt < this.moveAmtTop)) {
            if (!this.fullscreen) {
                this.moveAmt += .05;
            } else {
                this.moveAmt = this.moveAmtTop;
            }
        }

        // let inBoundsLeft = (this.playerX > 5);
        // let inBoundsRight = (this.playerX < this.world.width - 5);
        // let inBoundsTop = (this.playerY > 5);
        // let inBoundsBottom = (this.playerY < this.world.height - 5);
        // let angle = ((this.angle % 360) + 360) % 360;

        // if (angle <= 180 && angle >= 0) {
        //     inBoundsLeft = true;
        // }
        // if (angle <= 360 && angle >= 180) {
        //     inBoundsRight = true;
        // }
        // if (angle <= 270 && angle >= 90) {
        //     inBoundsTop = true;
        // }
        // if (angle <= 90 || angle >= 270) {
        //     inBoundsBottom = true;
        // }

        const dirRadians = (this.angle) * (Math.PI / 180);
        const moveX = this.moveAmt * Math.cos((90 * (Math.PI / 180)) - dirRadians);
        const moveY = this.moveAmt * Math.cos(dirRadians);

        const dirRadiansStrafe = dirRadians + Math.PI / 2;
        const strafeX = this.moveAmt * Math.cos((90 * (Math.PI / 180)) - dirRadiansStrafe) / 2;
        const strafeY = this.moveAmt * Math.cos(dirRadiansStrafe) / 2;

        const hittingF = this.moveDirRays.foreward < 5;
        const hittingL = this.moveDirRays.left < 5;
        const hittingR = this.moveDirRays.right < 5;
        const hittingB = this.moveDirRays.backward < 5;

        if (this.moveDirFB === 'forwards') {
            // if (this.allRays[Math.floor(this.allRays.length / 2)] > 5) {
            //     this.playerX += moveX;
            // }
            // if (this.allRays[Math.floor(this.allRays.length / 2)] > 5) {
            //     this.playerY -= moveY;
            // }

            if (!hittingF) {
                this.playerX += moveX;
            }
            if (!hittingF) {
                this.playerY -= moveY;
            }
        } else if (this.moveDirFB === 'backwards') {
            if (!hittingB) {
                this.playerX -= moveX;
            }
            if (!hittingB) {
                this.playerY += moveY;
            }
        }

        if (this.moveDirStrafe === 'left') {
            if (!hittingL) {
                this.playerX -= strafeX;
            }
            if (!hittingL) {
                this.playerY += strafeY;
            }
        } else if (this.moveDirStrafe === 'right') {
            if (!hittingR) {
                this.playerX += strafeX;
            }
            if (!hittingR) {
                this.playerY -= strafeY;
            }
        }
    }

    getIntersection = (x, y, r, theta, wall, rot) => {
        const adjustedAngle = theta + rot * (Math.PI / 180);
        const x1 = wall.x1;
        const y1 = wall.y1;
        const x2 = wall.x2;
        const y2 = wall.y2;

        const x3 = x;
        const y3 = y;
        const x4 = x + r * Math.cos(adjustedAngle);
        const y4 = y + r * Math.sin(adjustedAngle);

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom == 0) {
            return;
        }
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u  = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denom;

        if (t > 0 && t < 1 && u > 0) {
            const px = x3 + u * (x4 - x3);
            const py = y3 + u * (y4 - y3);
            return [px, py];
        } else {
            return;
        }
    }

    draw(x = this.playerX, y = this.playerY) {
        const ctx = world.getContext('2d');
        const r = 1;
        this.allRays = [];
        this.allSpriteRays = [];
        this.cornersInView = [];
        const rotation = ((this.rotation % 360) + 360) % 360;
        // let moveDirRaysFound = false;
        // const middleRayAngle = this.rayAngles[Math.floor(this.rayAngles.length / 2)];
        
        for (let i = 0; i < this.rayAngles.length; i ++) {
            let closest = null;
            let record = Infinity;
            let closestSprite = null;
            let recordSprite = Infinity;
            let recordCornerRayDiff = Infinity;
            
            for (const wall of this.allWalls) {
                const intersection = this.getIntersection(x, y, r, this.rayAngles[i], wall, rotation);

                if (intersection) {
                    const dx = Math.abs(x - intersection[0]);
                    const dy = Math.abs(y - intersection[1]);
                    const d = Math.sqrt(dx * dx + dy * dy);
                    
                    record = Math.min(d, record);
                    if (d <= record) {
                        record = d;
                        closest = intersection;
                    }
                }
            }

            for (const sprite of this.sprites) {
                const intersection = this.getIntersection(x, y, r, this.rayAngles[i], sprite, rotation);

                if (intersection) {
                    const dx = Math.abs(x - intersection[0]);
                    const dy = Math.abs(y - intersection[1]);
                    const d = Math.sqrt(dx * dx + dy * dy);
                    
                    recordSprite = Math.min(d, recordSprite);
                    if (d <= recordSprite) {
                        recordSprite = d;
                        closestSprite = intersection;
                    }
                }
            }

            if (closest) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(closest[0], closest[1]);
                ctx.strokeStyle = `rgba(255,255,255,${this.rayOpacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                for (const corner of this.allCorners) {
                    // const cornerDx = Math.abs(x - corner.x);
                    // const cornerDy = Math.abs(y - corner.y);
                    // const cornerD = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);

                    // const cornerRayDiff = Math.abs(cornerD - record);
                    const cornerSpread = 3;
                    if ((closest[0] > corner.x - cornerSpread && closest[0] < corner.x + cornerSpread) && (closest[1] > corner.y - cornerSpread && closest[1] < corner.y + cornerSpread)) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(corner.x, corner.y);
                        ctx.strokeStyle = `rgba(255,0,0,${this.rayOpacity})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        this.cornersInView.push(record);
                        break;
                    } 
                }

                this.allRays.push(record);
            } else {
                this.allRays.push(Infinity);
            }

            if (closestSprite) {
                const spriteRayAngle = (closestSprite[0] - x) < 0 
                ? 270 - Math.atan((closestSprite[1] - y) / -(closestSprite[0] - x)) * 180 / Math.PI
                : 90 + Math.atan((closestSprite[1] - y) / (closestSprite[0] - x)) * 180 / Math.PI
                const rayRotDiff = spriteRayAngle - (rotation + 90);
                const spritePosOnScreen = rayRotDiff / this.fov + 0.5;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(closestSprite[0], closestSprite[1]);
                ctx.strokeStyle = `rgba(255,0,0,${this.rayOpacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                this.allSpriteRays.push({rayLength: recordSprite, percAcrScreen: spritePosOnScreen});
            }
        }


        //get lengths for rays going in directions that the player can move in (F,B,L,R)
        const rotationF = ((this.rotation % 360) + 360) % 360;
        const rotationR = (((this.rotation + 90) % 360) + 360) % 360;
        const rotationB = (((this.rotation + 180) % 360) + 360) % 360;
        const rotationL = (((this.rotation - 90) % 360) + 360) % 360;

        let closestF = null;
        let recordF = Infinity;

        let closestL = null;
        let recordL = Infinity;

        let closestR = null;
        let recordR = Infinity;

        let closestB = null;
        let recordB = Infinity;
        
        for (const wall of this.allWalls) {
            const fIntersection = this.getIntersection(x, y, r, 0, wall, rotationF);
            const lIntersection = this.getIntersection(x, y, r, 0, wall, rotationL);
            const rIntersection = this.getIntersection(x, y, r, 0, wall, rotationR);
            const bIntersection = this.getIntersection(x, y, r, 0, wall, rotationB);

            if (fIntersection) {
                const dx = Math.abs(x - fIntersection[0]);
                const dy = Math.abs(y - fIntersection[1]);
                const d = Math.sqrt(dx * dx + dy * dy);

                recordF = Math.min(d, recordF);
                if (d <= recordF) {
                    recordF = d;
                    closestF = fIntersection;
                }
            }
            if (lIntersection) {
                const dx = Math.abs(x - lIntersection[0]);
                const dy = Math.abs(y - lIntersection[1]);
                const d = Math.sqrt(dx * dx + dy * dy);

                recordL = Math.min(d, recordL);
                if (d <= recordL) {
                    recordL = d;
                    closestL = lIntersection;
                }
            }
            if (rIntersection) {
                const dx = Math.abs(x - rIntersection[0]);
                const dy = Math.abs(y - rIntersection[1]);
                const d = Math.sqrt(dx * dx + dy * dy);

                recordR = Math.min(d, recordR);
                if (d <= recordR) {
                    recordR = d;
                    closestR = rIntersection;
                }
            }
            if (bIntersection) {
                const dx = Math.abs(x - bIntersection[0]);
                const dy = Math.abs(y - bIntersection[1]);
                const d = Math.sqrt(dx * dx + dy * dy);

                recordB = Math.min(d, recordB);
                if (d <= recordB) {
                    recordB = d;
                    closestB = bIntersection;
                }
            }
        }

        if (closestF) {
            this.moveDirRays.foreward = recordF;
        } else {
            this.moveDirRays.foreward = Infinity;
        }
        
        if (closestL) {
            this.moveDirRays.left = recordL;
        } else {
            this.moveDirRays.left = Infinity;
        }

        if (closestR) {
            this.moveDirRays.right = recordR;
        } else {
            this.moveDirRays.right = Infinity;
        }

        if (closestB) {
            this.moveDirRays.backward = recordB;
        } else {
            this.moveDirRays.backward = Infinity;
        }

        this.walls3d.draw(this.allRays, this.allSpriteRays, this.cornersInView);
    }
}