const canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

var mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
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

function Circle(x, y, radius, color) {

    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.follow = function(followX, followY, distanceConstraint, borderOn, hasEyes=false) {
        
        var dx;
        var dy;

        // follow an object from a distance
        if (distanceConstraint > 0) {

            dx = this.x - followX;
            dy = this.y - followY;
            var distance = Math.sqrt(dy**2 + dx**2);

            // the circle has left the constrained area
            if (distance > distanceConstraint) {

                if (difference !== 0) {
                    var dirX = dx / distance;
                    var dirY = dy / distance;

                    var difference = distanceConstraint - distance;
                    
                    // linear interpolation factor, smooth follow
                    /*var lerpFactor = 0.05;
                    this.x += (followX + difference * dirX - this.x) * lerpFactor;
                    this.y += (followY + difference * dirY - this.y) * lerpFactor;*/

                    this.x += difference * dirX;
                    this.y += difference * dirY;
                } 
            }

        // if no distance constraint was provided, follow directly
        } else {
            this.x = followX;
            this.y = followY;
        }

        this.draw(borderOn, hasEyes, dx, dy);

    }

    this.draw = function(borderOn, hasEyes=false, dx, dy) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

        if (borderOn === true) {
            ctx.strokeStyle = "black";
            ctx.stroke();
        } else {
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        ctx.closePath();

        if (hasEyes) {

            // use parametric equation to locate the sides of the segment
            const thetaLeftEye = Math.atan2(dy, dx) + Math.PI * 0.75;
            const thetaRightEye = Math.atan2(dy, dx) + Math.PI * 1.25;

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
    };
}

//var circlesArr = [seg3, seg2, seg1, head];
var circlesArr;

// initialize canvas object (in center of screen)
function init() {
    var head = new Circle(canvas.width / 2, canvas.height / 2, 65, 'purple');
    var seg1 = new Circle(canvas.width / 2, canvas.height / 2, 75, '#e7bf79');
    var seg2 = new Circle(canvas.width / 2, canvas.height / 2, 55, 'red');
    var seg3 = new Circle(canvas.width / 2, canvas.height / 2, 45, 'yellow');
    var seg4 = new Circle(canvas.width / 2, canvas.height / 2, 35, 'blue');

    circlesArr = [head, seg1, seg2, seg3, seg4];
}

var cX = canvas.width / 2;
var cY = canvas.height / 2;

function animate() {
    // this function should always be called before updating canvas
    requestAnimationFrame(animate);

    // clear canvas before drawing next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // having this order of follow commands results in the head 
    // being drawn on top of the other elements
    var size = circlesArr.length;

    if (size > 0) {

        for (var i = 0; i < size; i++) {

            segment = circlesArr[i];

            if (i === 0) {

                segment.follow(mouse.x, mouse.y, 65, true, true); 

            } else {
                prev = circlesArr[i-1];
                segment.follow(prev.x, prev.y, prev.radius, true);
            }
        }
    }

}

init();
animate();
