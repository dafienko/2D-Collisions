const canvas = document.getElementById('mainCanvas');
const context = canvas.getContext('2d');

var W = canvas.width;
var H = canvas.height;

function circle(x, y, r, color) {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

const elasticity = 1

class Ball {
    constructor(mass, color) {
        this.color = color
        this.x = .5
        this.y = .5

        this.vx = 0
        this.vy = 0

        this.setMass(mass)
    }

    setMass(mass) {
        this.mass = mass
        this.radius = Math.sqrt((.005 * mass) / Math.PI)
    }

    checkCollision(ball) {
        var distance = Math.sqrt(Math.pow(this.x -  ball.x, 2) + Math.pow(this.y - ball.y, 2))
        if (distance < this.radius + ball.radius) {
            var intersectionDistance = (this.radius + ball.radius) - distance
            
            var dirx = (ball.x - this.x) / distance
            var diry = (ball.y - this.y) / distance
            
            var collisionX = this.x + dirx * (this.radius - intersectionDistance * .5)
            var collisionY = this.y + diry * (this.radius - intersectionDistance * .5)

            // make it so the balls aren't intersecting anymore
            this.x -= intersectionDistance * .5 * dirx
            this.y -= intersectionDistance * .5 * diry            
            ball.x += intersectionDistance * .5 * dirx
            ball.y += intersectionDistance * .5 * diry

            var m1X = this.mass * this.vx
            var m1Y = this.mass * this.vy
            
            var m2X = ball.mass * ball.vx
            var m2Y = ball.mass * ball.vy

            var vxf = (m1X + m2X) / (this.mass + ball.mass)
            var vyf = (m1Y + m2Y) / (this.mass + ball.mass)

            this.vx = vxf
            this.vy = vyf
            ball.vx = vxf
            ball.vy = vyf
        }
    }

    applyVelocity(dt) {
        this.x += this.vx * dt
        this.y += this.vy * dt
    }

    render() {
        circle(this.x * W, this.y * H, this.radius * W, this.color)

        context.font = '36px serif';
        var str = this.mass + " kg"
        var metrics = context.measureText(str)
        context.fillStyle = "#FFFFFF"
        context.strokeStyle = "#000000"
        context.fillText(str, this.x * W - metrics.width / 2, this.y * H + 12);
        context.strokeText(str, this.x * W - metrics.width / 2, this.y * H + 12);
    }
}

var d1 = .45, d2 = .45

var ball1 = new Ball(1, "#FF0000")
ball1.vx = Math.random() * 2
var ball2 = new Ball(3, "#0000FF")
ball2.vy = -Math.random() * 2

var v1i = "<" + Math.round(ball1.vx * 100) / 100 + ", " + Math.round(ball1.vy * 100) / 100 + ">"
var v2i = "<" + Math.round(ball2.vx * 100) / 100 + ", " + Math.round(ball2.vy * 100) / 100 + ">"
var v1 = Math.sqrt(Math.pow(ball1.vx, 2) + Math.pow(ball1.vy, 2))
var v2 = Math.sqrt(Math.pow(ball2.vx, 2) + Math.pow(ball2.vy, 2))

if (v1 > v2) {
    d2 = (v2 * d1) / v1
} else {
    d1 = (v1 * d2) / v2
}
ball1.x = .5 - d1
ball1.y = .5
ball2.x = .5
ball2.y = .5 + d2

var lastTime = Date.now()
function draw() {
    var now = Date.now()
    var dt = (now - lastTime) / 1000
    lastTime = now

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    W = canvas.width;
    H = canvas.height;
    
    ball1.applyVelocity(dt)
    ball2.applyVelocity(dt)

    ball1.checkCollision(ball2)

    ball1.render()
    ball2.render()

    context.fillStyle = ball1.color
    context.fillText(v1i, .05 * W, .5 * H);
    var m = context.measureText(v2i)
    context.fillStyle = ball2.color
    context.fillText(v2i, .5 * W - m.width / 2, .95 * H);

    // execute loop function over and over
    requestAnimationFrame(draw);
}

draw()