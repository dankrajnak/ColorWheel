'use strict';

var width = window.innerWidth,
    height = window.innerHeight,
    radius = 30;
var mousePosition = [width / 2, height / 2];

/********CREATE TRIANGLES AND SPRINGS********/
var pointGenerator = new PoissonDisk(width, height, radius);
var points = pointGenerator.generatePoints();

var mass = 4;
var k = 2;
var pointSprings = [];
points.forEach(function (point) {
    return pointSprings.push(new Spring(point, mass, k));
});

var voronoi = d3.voronoi().extent([[-width, -height], [width * 2, height * 2]]);

var triangles = voronoi.triangles(points);

/********DRAW TRIANGLES********/
var canvas = d3.select('body').append('canvas').attr('width', width).attr('height', height);
var context = canvas.node().getContext('2d');

canvas.on('mousemove', function () {
    mousePosition = d3.mouse(this);
    points.length = 0;
    pointSprings.forEach(function (spring) {
        applyForceFromSource(spring, mousePosition, 300, 100);
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles();
});

var timer = d3.interval(function (elapsed) {
    points.length = 0;
    pointSprings.forEach(function (spring) {
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles();
}, 40);

/********HELPER FUNCTIONS********/

//Generates a color based on a position.
function color(d, position) {
    var dx = d[0] - position[0],
        dy = d[1] - position[1];
    return d3.lab(100 - (dx * dx + dy * dy) / 4000, dx / 5, dy / 5);
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
    console.log(force);
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
function drawTriangles() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    triangles.forEach(function (triangle) {
        context.beginPath();
        context.moveTo(triangle[2][0], triangle[2][1]);
        triangle.forEach(function (vertex) {
            return context.lineTo(vertex[0], vertex[1]);
        });
        var col = color(triangleCentroid(triangle), [mousePosition[0], mousePosition[1]]).toString();
        context.fillStyle = col;
        context.strokeStyle = col;
        context.stroke();
        context.fill();
        context.closePath();
    });
}