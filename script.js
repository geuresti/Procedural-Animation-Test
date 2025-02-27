const canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const devMode = false;

var mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2,
    radius: 65,
};

addEventListener("mousemove", function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

addEventListener("resize", function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    init();
});

const turnThreshold = 0.78;
const followSpeed = 0.05;

function Circle(x, y, dx, dy, radius, color) {

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.leftSideX;
    this.leftSideY;
    this.rightSideX;
    this.rightSideY;

    this.follow = function(segment, hasEyes=false, isHead=false, isTail=false) {
        // follow an object from a distance
        if (segment.radius > 0) {

            this.dx = this.x - segment.x;
            this.dy = this.y - segment.y;

            var distance = Math.sqrt(this.dy**2 + this.dx**2);

            // the circle has left the constrained area
            if (distance > segment.radius) {

                if (distance !== 0) {

                    var dirX = this.dx / distance;
                    var dirY = this.dy / distance;

                    var difference = segment.radius - distance;

                    /*var angle1 = Math.atan2(this.dy, this.dx);
                    var angle2 = Math.atan2(segment.y - this.y, segment.x - this.x);
                    var angle2 = Math.atan2(segment.dy, segment.dx);

                    var angularDiff = (angle2 - angle1 + Math.PI) % (2 * Math.PI) - Math.PI;
                    */

                    // need to check current angle against object im following
                    /*if (angularDiff > turnThreshold) {
                        // calculate smallest angular diff
                        console.log("agmonus");
                        var newAngle = angle1 + Math.max(-turnThreshold, Math.min(angularDiff, turnThreshold));
                        this.x += Math.cos(newAngle) * difference;
                        this.y += Math.sin(newAngle) * difference;
                        
                    } else {
                        this.x += difference * dirX;
                        this.y += difference * dirY;
                    }*/

                    this.x += difference * dirX * followSpeed;
                    this.y += difference * dirY * followSpeed;

                } 
            }

        }

        this.draw(segment, hasEyes, isHead, isTail);
    }

    this.draw = function(segment, hasEyes, isHead, isTail) {

        // calculate sides
        const leftSideTheta = Math.atan2(this.dy, this.dx) + Math.PI * 0.5;
        this.leftSideX = this.x + this.radius * Math.cos(leftSideTheta);
        this.leftSideY = this.y + this.radius * Math.sin(leftSideTheta);

        const rightSideTheta = Math.atan2(this.dy, this.dx) + Math.PI * 1.5;
        this.rightSideX = this.x + this.radius * Math.cos(rightSideTheta);
        this.rightSideY = this.y + this.radius * Math.sin(rightSideTheta);
        
        ctx.fillStyle = this.color;
        ctx.lineWidth = 3;

        // add skin over head
        if (isHead) {
            const theta = Math.atan2(this.dy, this.dx);

            const startAngle = theta - (Math.PI / 2);

            const endAngle = theta + (Math.PI / 2);

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, startAngle, endAngle, true);

            if (devMode) {
                ctx.stroke();
            } else {
                ctx.fill();
            }

            ctx.closePath();
        }

        // add skin over tail
        if (isTail) {
            const theta = Math.atan2(this.dy, this.dx);

            const startAngle = theta - (Math.PI / 2);

            const endAngle = theta + (Math.PI / 2);

            ctx.beginPath();

            ctx.arc(this.x, this.y, this.radius, startAngle, endAngle);

            if (devMode) {
                ctx.stroke();
            } else {
                ctx.fill();
            }

            ctx.closePath();
        }

        // draw eyes
        if (hasEyes) {

            // use parametric equation to locate the sides of the segment
            const thetaLeftEye = Math.atan2(this.dy, this.dx) + Math.PI * 0.75;
            const thetaRightEye = Math.atan2(this.dy, this.dx) + Math.PI * 1.25;

            const eyeLeftX = this.x + this.radius * Math.cos(thetaLeftEye);
            const eyeLeftY = this.y + this.radius * Math.sin(thetaLeftEye);

            const eyeRightX = this.x + this.radius * Math.cos(thetaRightEye);
            const eyeRightY = this.y + this.radius * Math.sin(thetaRightEye);

            ctx.beginPath();

            ctx.arc(eyeLeftX, eyeLeftY, 8, 0, Math.PI * 2, false);
            ctx.arc(eyeRightX, eyeRightY, 8, 0, Math.PI * 2, false);

            ctx.fillStyle = "orange";
            ctx.fill();
            ctx.closePath();
        }

        if (devMode) {
            // outline body segment
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.strokeStyle = "black";
            ctx.stroke();
            ctx.closePath();

            // mark sides
            ctx.beginPath();
            ctx.arc(this.leftSideX, this.leftSideY, 8, 0, Math.PI * 2, false);
            ctx.arc(this.rightSideX, this.rightSideY, 8, 0, Math.PI * 2, false);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath(); 
        }
        
        ctx.lineWidth = 3;
        // add skin
        ctx.beginPath();

        // start on the left side, move to the previous segment's left side,
        // then the previous segment's right side, then this segment's right side
        ctx.moveTo(this.leftSideX, this.leftSideY);
        ctx.lineTo(segment.leftSideX, segment.leftSideY);
        ctx.lineTo(segment.rightSideX, segment.rightSideY);
        ctx.lineTo(this.rightSideX, this.rightSideY);

        if (devMode) {
            ctx.strokeStyle = "blue";
            ctx.stroke();
        } else {
            ctx.fill();
        }

        ctx.closePath();

    };
}

function generateRandomCoordinates() {

    var randX = Math.random() * canvas.width;
    var randY = Math.random() * canvas.height;

    director.x = randX;
    director.y = randY;

}

var circlesArr;
var size;
const mainColor = "#85d589";

// initialize canvas object (in center of screen)
function init() {
    var head = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 65, mainColor);
    var seg1 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 75, mainColor);
    var seg2 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 55, mainColor);
    var seg3 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 65, mainColor);
    var seg4 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 55, mainColor);
    var seg5 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 65, mainColor);
    var seg6 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 50, mainColor);

    circlesArr = [head, seg1, seg2, seg3, seg4, seg5, seg6];

    size = circlesArr.length;
}

var director = new Circle(canvas.width / 2 - 100, canvas.height / 2 - 100, 0, 0, 80, mainColor);

function animate() {

    // this function should always be called before updating canvas
    requestAnimationFrame(animate);

    // clear canvas before drawing next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(director.x, director.y, director.radius, 0, Math.PI * 2, false);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();

    // animate each segment
    if (size > 0) {

        for (var i = 0; i < size; i++) {

            segment = circlesArr[i];

            if (i === 0) {
                //segment.follow(mouse, true, true);
                segment.follow(director, true, true);
            } else if (i === size - 1) {
                prev = circlesArr[i-1];
                segment.follow(prev, false, false, true);
            } else {
                prev = circlesArr[i-1];
                segment.follow(prev);
            }
        }
    }

}

init();
animate();

//setInterval(generateRandomCoordinates, 2000);
generateRandomCoordinates();
