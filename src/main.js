const width = window.innerWidth,
    height = window.innerHeight,
    radius = 30;
let mousePosition = [width / 2, height / 2];

/********CREATE TRIANGLES AND SPRINGS********/
const pointGenerator = new PoissonDisk(width, height, radius);
const points = pointGenerator.generatePoints();

const mass = 4;
const k = 2;
let pointSprings = [];
points.forEach((point) => pointSprings.push(new Spring(point, mass, k)));

const voronoi = d3.voronoi()
    .extent([[-width, -height], [width*2, height*2]]);

let triangles = voronoi.triangles(points);

/********DRAW TRIANGLES********/
const canvas = d3.select('body').append('canvas').attr('width', width).attr('height', height);
const context = canvas.node().getContext('2d');


canvas.on('mousemove', function () {
    mousePosition = d3.mouse(this);
    points.length = 0;
    pointSprings.forEach((spring) => {
        applyForceFromSource(spring, mousePosition, 300, 100);
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles();
});

const timer = d3.interval(function (elapsed) {
    points.length = 0;
    pointSprings.forEach((spring) => {
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles();
}, 40)

/********HELPER FUNCTIONS********/

//Generates a color based on a position.
function color(d, position) {
    const dx = d[0] - position[0],
        dy = d[1] - position[1];
    return d3.lab(100 - (dx * dx + dy * dy) / 4000, dx / 5, dy / 5);
}

//Calculates the centroid of a triangle.
function triangleCentroid(triangle) {
    return [(triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3, (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3]
}

//Applies the force on a spring from force field at source.
function applyForceFromSource(spring, source, maxStrength, radius = 10) {
    const dist = distance(spring.position, source);
    const force = radius*maxStrength / (radius + dist);
    console.log(force);
    //Similar triangles
    const fx = (spring.position[0] - source[0]) * force / dist;
    const fy = (spring.position[1] - source[1]) * force / dist;
    spring.applyForce([fx, fy]);
}

//Calculates Euclidiean distance between two points.
function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

//Draw pointSprings on canvas
function drawPointSprings() {
    context.clearRect(0, 0, width, height);
 
    pointSprings.forEach((spring) => {
        context.beginPath();
        context.ellipse(spring.position[0], spring.position[1], 2, 2, 0, 0, Math.PI * 2);
        context.fillStyle = 'black'
        context.fill();
        context.closePath();
    });
}

//Draws the triangles on the canvas.
function drawTriangles() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'black';
    context.fillRect(0,0, width, height)
    triangles.forEach((triangle) => {
        context.beginPath();
        context.moveTo(triangle[2][0], triangle[2][1]);
        triangle.forEach((vertex) => context.lineTo(vertex[0], vertex[1]));
        var col = color(triangleCentroid(triangle), [mousePosition[0], mousePosition[1]]).toString();
        context.fillStyle = col;
        context.strokeStyle = col;
        context.stroke();
        context.fill();
        context.closePath();
    });
}