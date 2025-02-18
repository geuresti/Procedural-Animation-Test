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

//function Circle(x, y, dx, dy, radius, color) {
function Circle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    //this.dx = dx;
    //this.dy = dy;
    this.radius = radius;
    this.color = color;

    this.followMouse = function(borderOn) {
        this.x = mouse.x;
        this.y = mouse.y;
        this.draw(borderOn);
    }

    this.followMouseBorder = function(borderOn) {

        var dx = this.x - mouse.x;
        var dy = this.y - mouse.y;
        var distance = Math.sqrt(dy**2 + dx**2);

       // if (dist + this.radius > distanceConstraint) {
        if (distance > distanceConstraint) {

            console.log("circle has left the border");

            if (difference !== 0) {
                var dirX = dx / distance;
                var dirY = dy / distance;

                var difference = distanceConstraint - distance;

                // linear interpolation factor
                var lerpFactor = 0.05;

                this.x += (mouse.x + difference * dirX - this.x) * lerpFactor;
                this.y += (mouse.y + difference * dirY - this.y) * lerpFactor;
            } 

        }

        this.draw(borderOn);
    }

    this.update = function(borderOn) {
        this.draw(borderOn);
    }

    this.draw = function(borderOn) {
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
    };
}

var mouseBorder;
var point;
const distanceConstraint = 75;

// initialize canvas object (in center of screen)
function init() {
    mouseBorder = new Circle(canvas.width / 2, canvas.height / 2, distanceConstraint, '');
    point = new Circle(canvas.width / 2, canvas.height / 2, 15, '#e7bf79');
}

var cX = canvas.width / 2;
var cY = canvas.height / 2;

// handles animation, constantly running
function animate() {
    // this function should always be called before updating the canvas because:
    //  browser optimization
    //  animations in inactive tabs won't play
    //  better for saving battery
    requestAnimationFrame(animate);

    // clear canvas before drawing next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillText("hello", mouse.x, mouse.y);

    // update the circle object I created
    mouseBorder.followMouse(true);
    point.followMouseBorder(false);
}

init();
animate();
