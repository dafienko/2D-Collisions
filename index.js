const canvas = document.getElementById('mainCanvas');
const context = canvas.getContext('2d');

var W = canvas.width;
var H = canvas.height;

function rad(d) {
	return d * (Math.PI / 180)
}

function deg(r) {
	return r * (180 / Math.PI)
}

function circle(x, y, r, color) {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

function arrow(from, to, color) {
	var nDir = from.subtract(to, true)
	nDir.normalize();
	var arrowLeft = nDir.rotate(rad(-45), false, true).multiply(15, true)
	arrowLeft.add(to)
	var arrowRight = nDir.rotate(rad(45), false, true).multiply(15, true)
	arrowRight.add(to)

	context.beginPath();
	context.lineWidth = 3
	context.strokeStyle = color
	context.moveTo(from.x , from.y )
	context.lineTo(to.x , to.y)
	
	//*
	context.lineTo(arrowLeft.x, arrowLeft.y)
	context.moveTo(to.x, to.y)
	context.lineTo(arrowRight.x, arrowRight.y)
	//*/
	context.stroke();
}

function relToAbs(v) {
	//return v
	return new Vec2(v.x * 1.0 * W, v.y * 1.0 * H)
}

const elasticity = 1

function hexToDec(hex) {
	var n = 0
	hex = hex.toUpperCase()

	for (var i = 0; i < hex.length; i++) {
		var digit = hex.charCodeAt(hex.length - (i + 1));
		if (digit >= 65) {
			digit -= 55
		} else {
			digit -= 48
		}
		n += digit * Math.pow(16, i)
	}

	return n
}

function decToHex(n) {
	var i = 0;
	var hex = ""

	while (n > 0) {
		var digit = n % 16
		n = Math.floor(n / 16)
		
		if (digit < 10) {
			hex = digit.toString() + hex
		} else {
			hex = String.fromCharCode(digit + 55) + hex
		}
	}

	return hex;
}

class Ball {
    constructor(mass, color) {
        this.color = color
        this.position = new Vec2(.5, .5)
        this.velocity = new Vec2(0, 0)

        this.setMass(mass)
    }

    setMass(mass) {
        this.mass = mass
        this.radius = Math.sqrt((.005 * mass) / Math.PI)
    }

    checkCollision(ball) {
        var distance = ball.position.distance(this.position)
        if (distance < this.radius + ball.radius) {
            var intersectionDistance = (this.radius + ball.radius) - distance
            
            var normal = this.position.subtract(ball.position, true).normalize(true)

			var collisionPosition = this.position.add(normal.multiply(this.radius - intersectionDistance * .5, true), true)

			// make balls no longer intersect
			this.position.add(normal.multiply(intersectionDistance * .5, true))
			ball.position.add(normal.multiply(intersectionDistance * -.5, true))
			
			var σ = this.radius + ball.radius
			this.velocity.subtract(normal.multiply(2 * this.velocity.dot(normal)))
			normal.multiply(-1)
			ball.velocity.subtract(normal.multiply(2 * ball.velocity.dot(normal)))
        }
    }

    applyVelocity(dt) {
        this.position.add(this.velocity.multiply(dt, true))
    }

    render() {
		var r = this.radius * W
		
        circle(this.position.x * W, this.position.y * H, r, this.color)
    }

	renderVelocity() {
		var v = this.velocity.multiply(.1, true)
		var c = "#"
		
		for (var i = 0; i < 3; i++) {
			var ch = this.color.substring(1 + i * 2, (i + 1) * 2 + 1)
			var component = decToHex(Math.max(180, hexToDec(ch)))
			
			if (component.length < 2) {
				component = "0" + component
			}
			
			c += component
		}
		
		arrow(relToAbs(this.position), relToAbs(this.position.add(v, true)), c)
	}
}

var d1 = .45, d2 = .45

var ball1 = new Ball(Math.random() * 3, "#FF0000")
ball1.velocity = new Vec2(Math.random() * 2, 0)
var ball2 = new Ball(Math.random() * 3, "#0000FF")
ball2.velocity = new Vec2(0, -Math.random() * 2)

var v1i = "<" + Math.round(ball1.velocity.x * 100) / 100 + ", " + Math.round(ball1.velocity.y * 100) / 100 + ">"
var v2i = "<" + Math.round(ball2.velocity.x * 100) / 100 + ", " + Math.round(ball2.velocity.y * 100) / 100 + ">"
var v1 = ball1.velocity.length()
var v2 = ball2.velocity.length()

if (v1 > v2) {
    d2 = (v2 * d1) / v1
} else {
    d1 = (v1 * d2) / v2
}
ball1.position = new Vec2(.5 - d1, .5)
ball2.position = new Vec2(.5, .5 + d2)

var lastTime = Date.now()
function draw() {
    var now = Date.now()
    var dt = (now - lastTime) / 1000
    lastTime = now

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    W = canvas.width;
    H = canvas.height;

	context.fillStyle = "#F0F0F0";
	context.fillRect(0, 0, W, H);
    
    ball1.applyVelocity(dt)
    ball2.applyVelocity(dt)

    ball1.checkCollision(ball2)

    ball1.render()
    ball2.render()
	ball1.renderVelocity()
	ball2.renderVelocity()

	var fontSize = 30
	context.font = fontSize + 'px serif';
    context.fillStyle = ball1.color
    context.fillText(v1i, fontSize, .5 * H - fontSize * .5);
    var massStr = Math.round(ball1.mass * 100) / 100 + "kg"
	context.fillText(massStr, fontSize, .5 * H + fontSize * .5)
	var m = context.measureText(v2i)
    context.fillStyle = ball2.color
    context.fillText(v2i, .5 * W - m.width / 2, H - fontSize * 2);
	massStr = Math.round(ball2.mass * 100) / 100 + "kg"
	m = context.measureText(massStr)
	context.fillText(massStr, .5 * W - m.width / 2, H - fontSize * 1);

	//arrow(Vec2(.5 * W, .5 * H), Vec2(.7 * W, .6 * H), "#00FF00")

    // execute loop function over and over
    requestAnimationFrame(draw);
}

draw()