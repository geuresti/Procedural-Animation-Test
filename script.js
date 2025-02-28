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

function Circle(x, y, radius, mainColor, secondaryColor, angle=0) {

    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
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

function generateRandomCreature(segmentCount, avgSegmentSize, segmentSizeRange, mainColor, secondaryColor) {

    var newCreature = [];
    var intialAngle = Math.random() * Math.PI * 2;

    var director = new Circle(canvas.width / 2 - 100, canvas.height / 2 - 100, 20, mainColor, secondaryColor, intialAngle);
    
    var followRange;

    for (var i = 0; i < segmentCount; i++) {
        newCreature.push(new Circle(
            canvas.width / 2,
            canvas.height / 2,
            Math.random() * ((avgSegmentSize + segmentSizeRange) - (avgSegmentSize - segmentSizeRange) + 1) + (avgSegmentSize - segmentSizeRange),
            mainColor,
            secondaryColor
        ));
    }

    var followRange = newCreature[0].radius + director.radius;

    return [newCreature, director, followRange];
}

function generateCreature(segmentRadii, mainColor, secondaryColor) {
    var newCreature = [];
    var intialAngle = Math.random() * Math.PI * 2;

    var director = new Circle(canvas.width / 2 - 100, canvas.height / 2 - 100, 20, mainColor, secondaryColor, intialAngle);
    
    var followRange;

    var segmentCount = segmentRadii.length;

    for (var i = 0; i < segmentCount; i++) {
        newCreature.push(new Circle(
            canvas.width / 2,
            canvas.height / 2,
            segmentRadii[i],
            mainColor,
            secondaryColor
        ));
    }

    var followRange = newCreature[0].radius + director.radius;

    return [newCreature, director, followRange];
}

function animateCreature(creature) {

    var segmentCount = creature[BODY].length;

    for (var i = 0; i < segmentCount; i++) {

        segment = creature[BODY][i];

        if (i === 0) {
            segment.follow(creature[DIRECTOR], true, true);
        } else if (i === segmentCount - 1) {
            prev = creature[BODY][i-1];
            segment.follow(prev, false, false, true);
        } else {
            prev = creature[BODY][i-1];
            segment.follow(prev);
        }
    }

    var directorDistance = Math.sqrt((creature[BODY][HEAD].dx ** 2 + creature[BODY][HEAD].dy ** 2));

    if (directorDistance < creature[FOLLOW_RANGE]) {
        generateNewPosition(creature[DIRECTOR]);
    }

    return 0
}

const HEAD = 0;
const BODY = 0;
const DIRECTOR = 1;
const FOLLOW_RANGE = 2;

var creatureA;
var creatureB;
var creatureC;
var creatureD; 

// initialize canvas object (in center of screen)
function init() {
    creatureA = generateRandomCreature(8, 35, 2, "purple", "green");
    creatureB = generateRandomCreature(7, 50, 1, "#85d589", "orange");
    creatureC = generateCreature([55, 55, 45, 55, 45, 55, 40], "pink", "lightblue");
    creatureD = generateCreature([30, 30, 30, 30, 30, 30, 30, 30], "#d5dc41", "#54c2fc");
    creatureE = generateRandomCreature(7, 40, 10, "brown", "yellow");
}

function animate() {

    // this function should always be called before updating canvas
    requestAnimationFrame(animate);

    // clear canvas before drawing next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    animateCreature(creatureA);
    animateCreature(creatureB);
    animateCreature(creatureC);
    animateCreature(creatureD);
    animateCreature(creatureE);
}

init();
animate();
