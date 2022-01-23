import Walls3d from "./walls3d.js";

export default class LightSource {
    constructor(world, world3d, allWalls) {
        this.world = world;
        this.world3d = world3d;
        this.allWalls = allWalls;
        this.rayIncrement = 0.2;
        this.rayOpacity = 0.07;
        this.fov = 45;
        this.rotation = 0;
        this.playerX = world.width / 2;
        this.playerY = world.height / 2;
        this.moveAmt = 2;
        this.angle = 90;
        this.rotationAmt = 1.5;
        this.moveDirFB = null;
        this.moveDirLR = null;
        this.walls3d = new Walls3d(world3d, this.fov);
        this.flashlight = document.querySelector('.flashlight');
        this.fovRad = this.fov * (Math.PI / 180);
        this.distToProjectionPlane = (world3d.width / 2) / Math.tan(this.fovRad / 2);
        this.rayAngles = [];
        this.rayDensityAdjustment = 5;
    }

    setAngles() {
        console.log('test')
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

    setFov(arrow) {
        if (this.fov > 0 && this.fov < 180) {
            if (arrow === 'down' && this.fov > 0) {
                this.fov -= 1;
            } else if (arrow === 'up' && this.fov < 180) {
                this.fov += 1;
            }
        }
        this.fovRad = this.fov * (Math.PI / 180);
        this.setAngles();
    }

    setRayDensity(key) {
        if (key === 'e' && this.rayDensityAdjustment > 1) {
            this.rayDensityAdjustment -= 1;
            this.rayOpacity -= 0.01;
        } else if (key === 'q' && this.rayDensityAdjustment < 100) {
            this.rayDensityAdjustment += 1;
            this.rayOpacity += 0.01;
        }
        this.setAngles();
    }

    setRotation(dir) {
        this.moveDirLR = dir;
    }

    rotate() {
        if (this.moveDirLR === 'left') {
            this.rotation -= this.rotationAmt;
            this.angle -= this.rotationAmt;
        } else if (this.moveDirLR === 'right') {
            this.rotation += this.rotationAmt;
            this.angle += this.rotationAmt;
        }
    }

    setMoveDir(dir) {
        this.moveDirFB = dir;
    }

    move() {
        let inBoundsLeft = (this.playerX > 5);
        let inBoundsRight = (this.playerX < this.world.width - 5);
        let inBoundsTop = (this.playerY > 5);
        let inBoundsBottom = (this.playerY < this.world.height - 5);
        let angle = ((this.angle % 360) + 360) % 360;

        if (angle <= 180 && angle >= 0) {
            inBoundsLeft = true;
        }
        if (angle <= 360 && angle >= 180) {
            inBoundsRight = true;
        }
        if (angle <= 270 && angle >= 90) {
            inBoundsTop = true;
        }
        if (angle <= 90 || angle >= 270) {
            inBoundsBottom = true;
        }

        const dirRadians = (this.angle) * (Math.PI / 180);
        const moveX = this.moveAmt * Math.cos((90 * (Math.PI / 180)) - dirRadians);
        const moveY = this.moveAmt * Math.cos(dirRadians);

        if (this.moveDirFB === 'forwards') {
            if (inBoundsLeft && inBoundsRight) {
                this.playerX += moveX;
            }
            if (inBoundsTop && inBoundsBottom) {
                this.playerY += -moveY;
            }
        } else if (this.moveDirFB === 'backwards') {
            if (true) {
                this.playerX += -moveX;
            }
            if (true) {
                this.playerY += moveY;
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
        const allWalls3d = [];
        const rotation = ((this.rotation % 360) + 360) % 360;
        
        for (let i = 0; i < this.rayAngles.length; i ++) {
            const r = 1;
            let closest = null;
            let record = Infinity;
            
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
            if (closest) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(closest[0], closest[1]);
                ctx.strokeStyle = `rgba(255,255,255,${this.rayOpacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.lineWidth = 1;
                allWalls3d.push(record);
            } else {
                allWalls3d.push(Infinity);
            }
        }

        this.walls3d.draw(allWalls3d);
    }

    clear() {
        const ctx = this.world.getContext('2d');
        ctx.clearRect(0, 0, this.world.width, this.world.height);
    }
}