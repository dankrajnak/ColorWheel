'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PoissonDisk = function () {
    function PoissonDisk(width, height, radius) {
        _classCallCheck(this, PoissonDisk);

        this.width = width;
        this.height = height;
        this.radius = radius;
    }

    _createClass(PoissonDisk, [{
        key: 'generatePoints',
        value: function generatePoints() {
            var points = [],
                activeSamples = [],
                numberToCheck = 30;
            // Add first point
            activeSamples.push([Math.random() * this.width, Math.random() * this.height]);

            while (activeSamples.length > 0) {
                //Get random active sample
                var activeSamplesIndex = Math.floor(Math.random() * activeSamples.length);
                var sample = activeSamples[activeSamplesIndex];

                //Generate new point within the annulus (r to 2r from sample)
                var newPoint = this._newPointInAnnulus(sample);
                var validPoint = false;
                for (var i = 0; i < numberToCheck; i++) {
                    //Point is valid if it is at least a radius away from all other points (active or not)
                    if (this._pointIsValid(newPoint, activeSamples.concat(points))) {
                        validPoint = true;
                        break;
                    }
                    newPoint = this._newPointInAnnulus(sample);
                }
                if (validPoint) {
                    activeSamples.push(newPoint);
                } else {
                    //No valid points found, remove this from active samples.
                    activeSamples.splice(activeSamplesIndex, 1);
                    points.push(sample);
                }
            }
            return points;
        }
    }, {
        key: '_newPointInAnnulus',
        value: function _newPointInAnnulus(point) {
            var x = point[0],
                y = point[1];
            var dist = Math.random() * this.radius + this.radius;
            var angle = Math.random() * Math.PI * 2;
            var dx = dist * Math.cos(angle);
            var dy = dist * Math.sin(angle);
            return [x + dx, y + dy];
        }
    }, {
        key: '_pointIsValid',
        value: function _pointIsValid(point, samples) {
            var _this = this;

            if (point[0] < -this.radius || point[0] > this.width + this.radius) {
                return false;
            }

            if (point[1] < -this.radius || point[1] > this.height + this.radius) {
                return false;
            }
            var valid = true;

            samples.forEach(function (sample) {
                if (Math.sqrt(Math.pow(point[0] - sample[0], 2) + Math.pow(point[1] - sample[1], 2)) < _this.radius) {
                    valid = false;
                    return; //exit forEach
                }
            });
            return valid;
        }
    }]);

    return PoissonDisk;
}();

var Spring = function () {
    //Creates a spring based on Hooke's Law.
    function Spring(base) {
        var mass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
        var k = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
        var damping = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : .7;

        _classCallCheck(this, Spring);

        this._appliedForce = [0, 0];
        this._previousAcceleration = [0, 0];
        this._velocity = [0, 0];

        this.position = base.slice();
        this.base = base;
        this.mass = mass;
        this.k = k;
        this.damping = damping;
    }

    _createClass(Spring, [{
        key: 'applyForce',
        value: function applyForce(force) {
            this._appliedForce = force;
        }
    }, {
        key: 'update',
        value: function update() {
            var springForce = [];
            springForce[0] = -this.k * (this.position[0] - this.base[0]);
            springForce[1] = -this.k * (this.position[1] - this.base[1]);

            var force = [springForce[0] + this._appliedForce[0], springForce[1] + this._appliedForce[1]];
            this._appliedForce = [0, 0];

            //Using leapfrog integration.
            this._velocity[0] += this.damping * .5 * (this._previousAcceleration[0] + force[0] / this.mass);
            this._velocity[1] += this.damping * .5 * (this._previousAcceleration[1] + force[1] / this.mass);

            this._previousAcceleration = [force[0] / this.mass, force[1] / this.mass];

            this.position[0] += this._velocity[0] + .5 * force[0] / this.mass;
            this.position[1] += this._velocity[1] + .5 * force[1] / this.mass;

            //        const tableInfo = {
            //            previousAccelleration: this._previousAcceleration,
            //            springForce: this._springForce,
            //            force: force,
            //            velocity: this._velocity,
            //            positionVector: [this.position[0] - this.base[0], this.position[1] - this.base[1]]
            //        }
            //
            //        console.table(tableInfo);
        }
    }]);

    return Spring;
}();

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

/***************************************************************************************************************/

/*  HELPER FUNCTIONS  */

//Generates a color based on a position.
function wheelColor(point, center) {
    var dx = point[0] - center[0],
        dy = point[1] - center[1];
    return d3.lab(100 - (dx * dx + dy * dy) / 9000, dx / 5, dy / 5);
}

function apteColorBlack(point, center) {
    var apteRed = d3.rgb(157, 29, 33);
    var apteBlue = d3.rgb(167, 191, 209);
    var colorIntepolator = d3.interpolateCubehelix(apteRed, apteBlue);
    var color = d3.hsl(colorIntepolator(distance(point, [width / 2, height / 2]) / (diagonal / 2)));
    color.l += d3.easeCircleOut(distance(point, center) / diagonal) - distance(point, center) / (diagonal / 2) * 4;
    return color;
}

function apteColorWhite(point, center) {
    var apteRed = d3.rgb(157, 29, 33);
    var apteBlue = d3.rgb(167, 191, 209);
    var colorIntepolator = d3.interpolateCubehelix(apteRed, apteBlue);
    var color = d3.hsl(colorIntepolator(distance(point, [width / 2, height / 2]) / (diagonal / 2)));
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
function drawTriangles() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#555";
    context.fillRect(0, 0, width, height);
    triangles.forEach(function (triangle) {
        context.beginPath();
        context.moveTo(triangle[2][0], triangle[2][1]);
        triangle.forEach(function (vertex) {
            return context.lineTo(vertex[0], vertex[1]);
        });
        var col = apteColorWhite(triangleCentroid(triangle), [mousePosition[0], mousePosition[1]]);
        context.strokeStyle = col.toString();
        col.opacity = .95;
        context.fillStyle = col.toString();

        context.fill();
        context.stroke();
        context.closePath();
    });
}