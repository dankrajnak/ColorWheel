"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
        key: "applyForce",
        value: function applyForce(force) {
            this._appliedForce = force;
        }
    }, {
        key: "update",
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