'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//author: Daniel Krajnak
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

//author: Daniel Krajnak


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
            var printInfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

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

            if (printInfo) {
                var tableInfo = {
                    previousAccelleration: this._previousAcceleration,
                    springForce: this._springForce,
                    force: force,
                    velocity: this._velocity,
                    positionVector: [this.position[0] - this.base[0], this.position[1] - this.base[1]]
                };
                console.table(tableInfo);
            }
        }
    }]);

    return Spring;
}();

var Wanderer = function () {
    function Wanderer(width, height) {
        _classCallCheck(this, Wanderer);

        this.width = width;
        this.height = height;
        this._wanderToFromStart = null;
        this._animationFrame;
        this._wandering = false;
        this._alpha = 3; //Parameter of easing function
        this._distanceFromToToFrom; //Fun one to name
        this._delay;
    }

    _createClass(Wanderer, [{
        key: 'startWandering',
        value: function startWandering(callBack, time) {
            var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var from = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [Math.random() * this.width, Math.random() * this.height];

            this._wandering = true;
            this._delay = delay;
            this.wanderToFrom([Math.random() * this.width, Math.random() * this.height], from, time, callBack);
        }
    }, {
        key: 'stopWandering',
        value: function stopWandering() {
            var immediately = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            this._wandering = false;
            if (immediately) {
                window.cancelAnimationFrame(this._animationFrame);
                this._wanderToFromStart = null;
            }
        }
    }, {
        key: 'wanderToFrom',
        value: function wanderToFrom(to, from, time, callback) {
            var _this2 = this;

            this._alpha = Math.random() * 3 + 2 | 0; //Randomly pick new alpha for easing function
            this._distanceFromToToFrom = this._euclideanDistance(to, from);
            this._animationFrame = window.requestAnimationFrame(function (timeStep) {
                return _this2._step(to, from, time, callback, timeStep);
            });
        }
    }, {
        key: '_step',
        value: function _step(to, from, totalTime, callback, timeStep) {
            var _this3 = this;

            if (!this._wanderToFromStart) this._wanderToFromStart = timeStep;

            var progress = timeStep - this._wanderToFromStart;
            callback(this._interpolate(to, from, Math.min(1, progress / totalTime)));
            if (progress < totalTime) this._animationFrame = window.requestAnimationFrame(function (newTimeStep) {
                return _this3._step(to, from, totalTime, callback, newTimeStep);
            });else {
                this._wanderToFromStart = null;
                //If wandering, wander from this point to a new one
                if (this._wandering) {
                    if (this._delay > 0) {
                        setTimeout(function () {
                            return _this3.wanderToFrom([Math.random() * _this3.width, Math.random() * _this3.height], to, totalTime, callback);
                        }, this._delay);
                    } else {
                        this.wanderToFrom([Math.random() * this.width, Math.random() * this.height], to, totalTime, callback);
                    }
                }
            }
        }
    }, {
        key: '_interpolate',
        value: function _interpolate(to, from, t) {
            return this._distanceDownLine(from, to, this._distanceFromToToFrom * this._easeInOut(t));
        }
    }, {
        key: '_easeInOut',
        value: function _easeInOut(t) {
            //easing function = t^a/(t^a+(1-t)^a).
            return Math.pow(t, this._alpha) / (Math.pow(t, this._alpha) + Math.pow(1 - t, this._alpha));
        }
    }, {
        key: '_distanceDownLine',
        value: function _distanceDownLine(pointA, pointB, distance) {
            /* Returns a point the given distance down the line specified */

            //Similar triangles
            var A = pointB[1] - pointA[1];
            var B = pointB[0] - pointA[0];
            if (A == 0 && B == 0) return pointA;
            var C = this._euclideanDistance(pointA, pointB);

            var x = B - B * (C - distance) / C;
            var y = A - A * (C - distance) / C;

            return [pointA[0] + x, pointA[1] + y];
        }
    }, {
        key: '_euclideanDistance',
        value: function _euclideanDistance(pointA, pointB) {
            //sqrt(a^2+b^2)
            return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
        }
    }]);

    return Wanderer;
}();

/*--------*/


document.addEventListener('keydown', function (event) {
    if (event.keyCode == 32) toggleFullScreen(document.getElementById('fullscreen'));
});

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

function resize() {
    //width = document.width;
    //height = document.height;
    height = window.screen.height;
    canvas.attr('width', width).attr('height', height);
    pointGenerator = new PoissonDisk(width, height, radius);
    points = pointGenerator.generatePoints();

    pointSprings.length = 0;
    points.forEach(function (point) {
        return pointSprings.push(new Spring(point, mass * (1 + Math.random()), k + (1 + Math.random()), Math.random() * .3 + .5));
    });

    voronoi = d3.voronoi().extent([[-width, -height], [width * 2, height * 2]]);
    triangles = voronoi.triangles(points);
}
/*----*/

var width = window.innerWidth,
    height = window.innerHeight,
    radius = 30;
var diagonal = distance([0, 0], [width, height]);
var mousePosition = [width / 2, height / 2];

//Resize logo
d3.select('svg').attr('width', width / 3);
/*-------------------------------------------------------------------------------*/

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
//let links = voronoi(points).links;

/*-------------------------------------------------------------------------------*/

/*  DRAW TRIANGLES  */
var container = document.getElementById('container'); //d3.select('#container')
var canvas = d3.select('#fullscreen').append('canvas').attr('width', width).attr('height', height);
var context = canvas.node().getContext('2d');

var colorProfile = apteColorWhite;

container.addEventListener('click', function () {
    if (colorProfile == apteColorBlack) {
        resize();
        d3.selectAll('svg path, svg polygon').style('fill', 'black').style('stroke', 'none');
        colorProfile = apteColorWhite;
    } else {
        d3.selectAll('svg path, svg polygon').style('fill', 'white').style('stroke', 'none');
        colorProfile = apteColorBlack;
    }
});

var wanderer = new Wanderer(width, height);
wanderer.startWandering(function (pos) {
    return move(pos);
}, 2000, 6000);

// container.addEventListener('mouseover', event=> wanderer.stopWandering(true));
// container.addEventListener('mousemove', event => move([event.offsetX, event.offsetY]));
// container.addEventListener('mouseout', event => wanderer.startWandering(pos=>move(pos), 3000, 500, [event.offsetX, event.offsetY]))

// container.on('mousemove', function(){
//     move(d3.mouse(this));
// }).on('touchmove', function(){
//     move(d3.mouse(this));
// });

function move(pos) {
    mousePosition = pos;
    points.length = 0;
    pointSprings.forEach(function (spring) {
        applyForceFromSource(spring, pos, 300, 100);
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles(colorProfile);
}

d3.interval(function (elapsed) {
    points.length = 0;
    pointSprings.forEach(function (spring) {
        spring.update();
        points.push(spring.position);
    });
    triangles = voronoi.triangles(points);
    drawTriangles(colorProfile);
}, 40);

/*-------------------------------------------------------------------------------*/

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
    on the outside of the canvas is lighter than the red towards the middle.*/
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
    context.fillStyle = "#000";
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