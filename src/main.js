/*--------*/
document.addEventListener('keydown', (event) => {
    if(event.keyCode == 32)
        toggleFullScreen(document.getElementById('fullscreen'));
})

function toggleFullScreen(element) {
    if (!document.mozFullScreen && !document.webkitFullScreen) {
      if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
      } else {
        element.webkitCancelFullScreen();
      }
    }
    resize();
}

function resize(){
    //width = document.width;
    //height = document.height;
    height = window.screen.height;
    canvas.attr('width', width).attr('height', height);
    pointGenerator = new PoissonDisk(width, height, radius);
    points = pointGenerator.generatePoints();

    pointSprings.length = 0;
    points.forEach((point) => pointSprings.push(new Spring(point, mass * (1 + Math.random()), k + (1 + Math.random()), Math.random() * .3 + .5)));

    voronoi = d3.voronoi()
        .extent([[-width, -height], [width * 2, height * 2]]);
    triangles = voronoi.triangles(points);

}
/*----*/


let width = window.innerWidth,
    height = window.innerHeight,
    radius = 30;
const diagonal = distance([0, 0], [width, height]);
let mousePosition = [width / 2, height / 2];

//Resize logo
d3.select('svg').attr('width', width / 3);
/*-------------------------------------------------------------------------------*/

/*  CREATE TRIANGLES AND SPRINGS  */
let pointGenerator = new PoissonDisk(width, height, radius);
let points = pointGenerator.generatePoints();

const mass = 4;
const k = 2;
let pointSprings = [];
points.forEach((point) => pointSprings.push(new Spring(point, mass * (1 + Math.random()), k + (1 + Math.random()), Math.random() * .3 + .5)));

let voronoi = d3.voronoi()
    .extent([[-width, -height], [width * 2, height * 2]]);

let triangles = voronoi.triangles(points);
//let links = voronoi(points).links;

/*-------------------------------------------------------------------------------*/

/*  DRAW TRIANGLES  */
const container = document.getElementById('container');  //d3.select('#container')
const canvas = d3.select('#fullscreen').append('canvas').attr('width', width).attr('height', height);
const context = canvas.node().getContext('2d');

let colorProfile = apteColorWhite;

container.addEventListener('click', () => {
    if (colorProfile == apteColorBlack) {
        resize();
        d3.selectAll('svg path, svg polygon').style('fill', 'black').style('stroke', 'none');
        colorProfile = apteColorWhite
    } else {
        d3.selectAll('svg path, svg polygon').style('fill', 'white').style('stroke', 'none');
        colorProfile = apteColorBlack;
    }
})

let wanderer = new Wanderer(width, height);
wanderer.startWandering((pos) => move(pos), 2000, 6000);

// container.addEventListener('mouseover', event=> wanderer.stopWandering(true));
// container.addEventListener('mousemove', event => move([event.offsetX, event.offsetY]));
// container.addEventListener('mouseout', event => wanderer.startWandering(pos=>move(pos), 3000, 500, [event.offsetX, event.offsetY]))

// container.on('mousemove', function(){
//     move(d3.mouse(this));
// }).on('touchmove', function(){
//     move(d3.mouse(this));
// });

function move(pos){
    mousePosition = pos;
    points.length = 0;
    pointSprings.forEach((spring) => {
        applyForceFromSource(spring, pos, 300, 100);
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles(colorProfile);
}

d3.interval(function (elapsed) {
    points.length = 0;
    pointSprings.forEach((spring) => {
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles(colorProfile);
}, 40)

/*-------------------------------------------------------------------------------*/


/*  HELPER FUNCTIONS  */

//Generates a color based on a position.
function wheelColor(point, center) {
    const dx = point[0] - center[0],
        dy = point[1] - center[1];
    return d3.lab(100 - (dx * dx + dy * dy) / 9000, dx / 5, dy / 5);
}

function apteColorBlack(point, center) {
    //Brand colors:
    const apteRed = d3.rgb(157, 29, 33);
    const apteBlue = d3.rgb(167, 191, 209);

    //Interpolate between the colors with gamma of 1.
    const colorIntepolator = d3.interpolateCubehelix(apteRed, apteBlue);

    //Finds the color of a point within the color gradient and converts it to hsl.
    let color = d3.hsl(colorIntepolator(distance(point, [width / 2, height / 2]) / (diagonal / 2)));

    /*Color gets lighter the closer it is to the 'center'  This is a little complicated just to help the circle
    be a more uniform size with the lighter color being towards the edges of the canvas.  It could approximated
    by -distance(point, center)/ (diagonal / 2) * 2.  */
    color.l += d3.easeCircleOut(distance(point, center) / diagonal) - distance(point, center) / (diagonal / 2) * 4;

    return color;
}

function apteColorWhite(point, center) {
    //Brand colors:
    const apteRed = d3.rgb(157, 29, 33);
    const apteBlue = d3.rgb(167, 191, 209);

    //Interpolate between the colors with gamma of 1.
    const colorIntepolator = d3.interpolateCubehelix(apteRed, apteBlue);

    //Finds the color of a point within the color gradient and converts it to hsl.
    let color = d3.hsl(colorIntepolator(distance(point, [width / 2, height / 2]) / (diagonal / 2)));

    /*First line makes colors lighter the farther away they are from the center according to the easing function.
    Second line reduces the amount that colors far from the center of the canvas (NOT 'center') because the blue
    on the outside of the canvas is lighter than the red towards the middle.*/
    color.l += d3.easeCircleOut(distance(point, center) / diagonal) -
        distance(point, [width / 2, height / 2]) / (diagonal / 2) / 6;

    return color;
}

//Calculates the centroid of a triangle.
function triangleCentroid(triangle) {
    return [(triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3, (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3]
}

//Applies the force on a spring from force field at source.
function applyForceFromSource(spring, source, maxStrength, radius = 10) {
    const dist = distance(spring.position, source);
    const force = radius * maxStrength / (radius + dist);
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
function drawTriangles(colorProfile) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height)
    triangles.forEach((triangle) => {
        context.beginPath();
        context.moveTo(triangle[2][0], triangle[2][1]);
        triangle.forEach((vertex) => context.lineTo(vertex[0], vertex[1]));
        var col = colorProfile(triangleCentroid(triangle), [mousePosition[0], mousePosition[1]]);
        context.strokeStyle = col.toString();
        col.opacity = .95;
        context.fillStyle = col.toString();

        context.fill();
        context.stroke();
        context.closePath();
    });
}
