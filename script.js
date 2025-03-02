const canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const stepSize = 10;
const maxTurnAngle = Math.PI / 8;

const HEAD = 0;
const BODY = 0;
const DIRECTOR = 1;
const FOLLOW_RANGE = 2;

const canvasCenterWidth = canvas.width / 2;
const canvasCenterHeight = canvas.height / 2;

const devMode = false;

var clicking = false;

var mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2,
    radius: 75,
};

addEventListener("mousedown", function(event) {
    clicking = true;
});

addEventListener("mouseup", function(event) {
    clicking = false;
});

addEventListener("mousemove", function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

addEventListener("resize", function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

const followSpeed = 0.65;

function Circle(x, y, radius, mainColor, secondaryColor, angle=0, isHead=false, hasEyes=false, headShape='A', isTail=false, tailShape='B') {

    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.radius = radius;

    this.mainColor = mainColor;
    this.secondaryColor = secondaryColor;
    this.isHead = isHead;
    this.hasEyes = hasEyes;
    this.headShape = headShape;
    this.isTail = isTail;
    this.tailShape = tailShape;

    this.angle = angle;
    this.leftSideX;
    this.leftSideY;
    this.rightSideX;
    this.rightSideY;

    this.follow = function(segment) {
        // follow an object from a distance

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

        this.draw(segment);
    }

    this.draw = function(segment) {

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
        if (this.isHead) {
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
        if (this.isTail) {
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
        if (this.hasEyes) {

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

function generateCreature(segmentCount, segmentRadii, avgSegmentSize, segmentSizeRange, mainColor, secondaryColor) {

    var newCreature = [];
    var intialAngle = Math.random() * Math.PI * 2;

    var director = new Circle(canvasCenterWidth  - 100, canvasCenterHeight / 2 - 100, 20, mainColor, secondaryColor, intialAngle);
    
    var followRange;

    var isHead = true;
    var hasEyes = true;
    var headShape = 'A';
    var isTail = false;
    var tailShape = 'A';

    var segmentSize;

    var predefinedSegments = segmentRadii.length > 0;

    for (var i = 0; i < segmentCount; i++) {

        if (predefinedSegments) {
            segmentSize = segmentRadii[i];
        } else {
            segmentSize = Math.random() * ((avgSegmentSize + segmentSizeRange) - (avgSegmentSize - segmentSizeRange) + 1) + (avgSegmentSize - segmentSizeRange);
        }

        if (i == segmentCount - 1) {
            isTail = true;
        }

        newCreature.push(new Circle(
            canvasCenterWidth,
            canvasCenterHeight,
            segmentSize,
            mainColor,
            secondaryColor,
            0,
            isHead,
            hasEyes,
            headShape,
            isTail,
            tailShape
        ));

        isHead = false;
        hasEyes = false;
    }

    var followRange = newCreature[0].radius + director.radius;

    return [newCreature, director, followRange];
}

function animateCreature(creature, controllable=false) {

    var segmentCount = creature[BODY].length;

    for (var i = 0; i < segmentCount; i++) {

        segment = creature[BODY][i];

        // head segment
        if (i === 0) {
            // If the creature is controllable and the mouse is held down,
            if (controllable && clicking) {
                // move the head segment towards the mouse position
                segment.follow(mouse);
            } else {
                // the head segment will attempt to move to the director's position
                segment.follow(creature[DIRECTOR])
            }
        } else {
            // a segment will follow the one ahead of it in the array
            prev = creature[BODY][i-1];

            // tail segment
            if (i === segmentCount - 1) {
                segment.follow(prev);
            } else {
            // regular body segment
                segment.follow(prev);
            }
        } 
        
    }

    // If we are controlling the creature, set its director to the mouse position
    // This will prevent snapping when releasing control of a creature
    if (controllable && clicking) {
        creature[DIRECTOR].x = mouse.x;
        creature[DIRECTOR].y = mouse.y;
    } else {
    // If the creature has reached its director, generate new director position
        var directorDistance = Math.sqrt((creature[BODY][HEAD].dx ** 2 + creature[BODY][HEAD].dy ** 2));

        if (directorDistance < creature[FOLLOW_RANGE]) {
            generateNewPosition(creature[DIRECTOR]);
        }
    }
}

var creatureA;
var creatureB;
var creatureC;
var creatureD; 

// initialize canvas object (in center of screen)
function init() {
    creatureA = generateCreature(8, [], 35, 2, "purple", "green");
    creatureB = generateCreature(7, [], 50, 1, "pink", "green");
    creatureC = generateCreature(7, [55, 55, 45, 55, 45, 55, 40], 0, 0, "#85d589", "orange");
    creatureD = generateCreature(8, [30, 30, 30, 30, 30, 30, 30, 30], 0, 0, "lightblue", "red");
    creatureE = generateCreature(7, [], 40, 10, "brown", "yellow");
}

function animate() {

    // this function should always be called before updating canvas
    requestAnimationFrame(animate);

    // clear canvas before drawing next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    animateCreature(creatureA);
    animateCreature(creatureB);
    animateCreature(creatureC, true);
    animateCreature(creatureD);
    animateCreature(creatureE);
}

init();
animate();
