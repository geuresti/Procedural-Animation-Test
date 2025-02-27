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
});

const followSpeed = 0.65;

function Circle(x, y, dx, dy, radius, mainColor, secondaryColor, angle=0) {

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.mainColor = mainColor;
    this.secondaryColor = secondaryColor;
    this.leftSideX;
    this.leftSideY;
    this.rightSideX;
    this.rightSideY;
    this.angle = angle;

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
        
        ctx.fillStyle = this.mainColor;
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

            ctx.fillStyle = this.secondaryColor;
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

const stepSize = 10;
const maxTurnAngle = Math.PI / 8;

function generateNewPosition(segment) {

    var newAngle = (Math.random() * 2 - 1) * maxTurnAngle;
    segment.angle += newAngle;

    var newX = segment.x + Math.cos(segment.angle) * stepSize;
    var newY = segment.y + Math.sin(segment.angle) * stepSize;

    if (newX < 20 || newX > canvas.width - 20) {
        segment.angle = Math.PI - segment.angle;
    }

    if (newY < 20 || newY > canvas.height - 20) {
        segment.angle = -segment.angle;
    }

    segment.x += Math.cos(segment.angle) * stepSize;
    segment.y += Math.sin(segment.angle) * stepSize;
}

const colorA = "#85d589";
const colorB = "orange"
const colorC = "#d5dc41";
const colorD = "#54c2fc";

/* --------------------------------- */
var creatureA;
var creatureASize;
var intialAngleA = Math.random() * Math.PI * 2;
var directorCreatureARadii;
var directorA = new Circle(canvas.width / 2 - 100, canvas.height / 2 - 100, 0, 0, 20, colorA, colorB, intialAngleA);
var distanceFromDirectorA;
/* --------------------------------- */
var creatureB;
var creatureBSize;
var intialAngleB = Math.random() * Math.PI * 2;
var directorCreatureBRadii;
var directorB = new Circle(canvas.width / 2 - 100, canvas.height / 2 - 100, 0, 0, 20, colorC, colorD, intialAngleB);
var distanceFromDirectorB;
/* --------------------------------- */

// initialize canvas object (in center of screen)
function init() {
    var headA = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 55, colorA, colorB);
    var segA1 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 55, colorA, colorB);
    var segA2 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 45, colorA, colorB);
    var segA3 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 55, colorA, colorB);
    var segA4 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 45, colorA, colorB);
    var segA5 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 55, colorA, colorB);
    var segA6 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 40, colorA, colorB);
    creatureA = [headA, segA1, segA2, segA3, segA4, segA5, segA6];
    creatureASize = creatureA.length;
    directorCreatureARadii = creatureA[0].radius + directorA.radius;
    generateNewPosition(directorA);
    /* --------------------------------- */
    var headB = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    var segB1 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    var segB2 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    var segB3 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    var segB4 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    var segB5 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    var segB6 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    var segB7 = new Circle(canvas.width / 2, canvas.height / 2, 0, 0, 30, colorC, colorD);
    creatureB = [headB, segB1, segB2, segB3, segB4, segB5, segB6, segB7];
    creatureBSize = creatureB.length;
    directorCreatureBRadii = creatureB[0].radius + directorB.radius;
    generateNewPosition(directorB);
}

function animate() {

    // this function should always be called before updating canvas
    requestAnimationFrame(animate);

    // clear canvas before drawing next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // animate each segment
    if (creatureASize > 0) {

        for (var i = 0; i < creatureASize; i++) {

            segment = creatureA[i];

            if (i === 0) {
                //segment.follow(mouse, true, true);
                segment.follow(directorA, true, true);
            } else if (i === creatureASize - 1) {
                prev = creatureA[i-1];
                segment.follow(prev, false, false, true);
            } else {
                prev = creatureA[i-1];
                segment.follow(prev);
            }
        }
    }

    distanceFromDirectorA = Math.sqrt((creatureA[0].dx ** 2 + creatureA[0].dy ** 2));

    if (distanceFromDirectorA < directorCreatureARadii) {
        generateNewPosition(directorA);
    }

    /* --------------------------------- */

    if (creatureBSize > 0) {

        for (var i = 0; i < creatureBSize; i++) {

            segment = creatureB[i];

            if (i === 0) {
                //segment.follow(mouse, true, true);
                segment.follow(directorB, true, true);
            } else if (i === creatureBSize - 1) {
                prev = creatureB[i-1];
                segment.follow(prev, false, false, true);
            } else {
                prev = creatureB[i-1];
                segment.follow(prev);
            }
        }
    }

    distanceFromDirectorB = Math.sqrt((creatureB[0].dx ** 2 + creatureB[0].dy ** 2));

    if (distanceFromDirectorB < directorCreatureBRadii) {
        generateNewPosition(directorB);
    }

}

init();
animate();
