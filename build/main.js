'use strict';

var width = window.innerWidth,
    height = window.innerHeight,
    radius = 30;
var diagonal = distance([0, 0], [width, height]);
var mousePosition = [width / 2, height / 2];

console.log(d3.hsl(50, 50, 50));
/*  CREATE TRIANGLES AND SPRINGS  */
var pointGenerator = new PoissonDisk(width, height, radius);
var points = pointGenerator.generatePoints();

var mass = 4;
var k = 2;
var pointSprings = [];
points.forEach(function (point) {
    return pointSprings.push(new Spring(point, mass * (1 + Math.random()), k + (1 + Math.random()), Math.random() * .3 + .5));
});

var voronoi = d3.voronoi().extent([[-width, -height], [width * 2, height * 2]]);

var triangles = voronoi.triangles(points);

/***************************************************************************************************************/

/*  DRAW TRIANGLES  */

var canvas = d3.select('body').append('canvas').attr('width', width).attr('height', height);
var context = canvas.node().getContext('2d');

var colorProfile = apteColorBlack;

canvas.on('click', function () {
    if (colorProfile == apteColorBlack) {
        colorProfile = apteColorWhite;
    } else {
        colorProfile = apteColorBlack;
    }
});

canvas.on('mousemove', function () {
    mousePosition = d3.mouse(this);
    points.length = 0;
    pointSprings.forEach(function (spring) {
        applyForceFromSource(spring, mousePosition, 300, 100);
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles(colorProfile);
});

d3.interval(function (elapsed) {
    points.length = 0;
    pointSprings.forEach(function (spring) {
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles(colorProfile);
}, 40);

/***************************************************************************************************************/

/*  HELPER FUNCTIONS  */

//Generates a color based on a position.
function wheelColor(point, center) {
    var dx = point[0] - center[0],
        dy = point[1] - center[1];
    return d3.lab(100 - (dx * dx + dy * dy) / 9000, dx / 5, dy / 5);
}

function apteColorBlack(point, center) {
    //Brand colors:
    var apteRed = d3.rgb(157, 29, 33);
    var apteBlue = d3.rgb(167, 191, 209);

    //Interpolate between the colors with gamma of 1.
    var colorIntepolator = d3.interpolateCubehelix(apteRed, apteBlue);

    //Finds the color of a point within the color gradient and converts it to hsl.
    var color = d3.hsl(colorIntepolator(distance(point, [width / 2, height / 2]) / (diagonal / 2)));

    /*Color gets lighter the closer it is to the 'center'  This is a little complicated just to help the circle 
    be a more uniform size with the lighter color being towards the edges of the canvas.  It could approximated
    by -distance(point, center)/ (diagonal / 2) * 2.  */
    color.l += d3.easeCircleOut(distance(point, center) / diagonal) - distance(point, center) / (diagonal / 2) * 4;

    return color;
}

function apteColorWhite(point, center) {
    //Brand colors:
    var apteRed = d3.rgb(157, 29, 33);
    var apteBlue = d3.rgb(167, 191, 209);

    //Interpolate between the colors with gamma of 1.
    var colorIntepolator = d3.interpolateCubehelix(apteRed, apteBlue);

    //Finds the color of a point within the color gradient and converts it to hsl.
    var color = d3.hsl(colorIntepolator(distance(point, [width / 2, height / 2]) / (diagonal / 2)));

    /*First line makes colors lighter the farther away they are from the center according to the easing function.
    Second line reduces the amount that colors far from the center of the canvas (NOT 'center') because the blue
    on the outside of the canvas is lighter than the red towards the middle.
    */
    color.l += d3.easeCircleOut(distance(point, center) / diagonal) - distance(point, [width / 2, height / 2]) / (diagonal / 2) / 6;

    return color;
}

//Calculates the centroid of a triangle.
function triangleCentroid(triangle) {
    return [(triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3, (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3];
}

//Applies the force on a spring from force field at source.
function applyForceFromSource(spring, source, maxStrength) {
    var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;

    var dist = distance(spring.position, source);
    var force = radius * maxStrength / (radius + dist);
    //Similar triangles
    var fx = (spring.position[0] - source[0]) * force / dist;
    var fy = (spring.position[1] - source[1]) * force / dist;
    spring.applyForce([fx, fy]);
}

//Calculates Euclidiean distance between two points.
function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

//Draw pointSprings on canvas
function drawPointSprings() {
    context.clearRect(0, 0, width, height);

    pointSprings.forEach(function (spring) {
        context.beginPath();
        context.ellipse(spring.position[0], spring.position[1], 2, 2, 0, 0, Math.PI * 2);
        context.fillStyle = 'black';
        context.fill();
        context.closePath();
    });
}

//Draws the triangles on the canvas.
function drawTriangles(colorProfile) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#555";
    context.fillRect(0, 0, width, height);
    triangles.forEach(function (triangle) {
        context.beginPath();
        context.moveTo(triangle[2][0], triangle[2][1]);
        triangle.forEach(function (vertex) {
            return context.lineTo(vertex[0], vertex[1]);
        });
        var col = colorProfile(triangleCentroid(triangle), [mousePosition[0], mousePosition[1]]);
        context.strokeStyle = col.toString();
        col.opacity = .95;
        context.fillStyle = col.toString();

        context.fill();
        context.stroke();
        context.closePath();
    });
}