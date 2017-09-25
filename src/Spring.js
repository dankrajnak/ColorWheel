class Spring {
    //Creates a spring based on Hooke's Law.
    constructor(base, mass = 4, k = 2, damping = .7) {
        this._appliedForce = [0, 0];
        this._previousAcceleration = [0, 0];
        this._velocity = [0, 0];

        this.position = base.slice();
        this.base = base;
        this.mass = mass;
        this.k = k;
        this.damping = damping;
    }

    applyForce(force) {
        this._appliedForce = force;
    }

    update(printInfo = false) {
        let springForce = [];
        springForce[0] = -this.k * (this.position[0] - this.base[0]);
        springForce[1] = -this.k * (this.position[1] - this.base[1]);


        const force = [springForce[0] + this._appliedForce[0], springForce[1] + this._appliedForce[1]];
        this._appliedForce = [0, 0];

        //Using leapfrog integration.
        this._velocity[0] += this.damping * .5 * (this._previousAcceleration[0] + force[0] / this.mass);
        this._velocity[1] += this.damping * .5 * (this._previousAcceleration[1] + force[1] / this.mass);

        this._previousAcceleration = [force[0] / this.mass, force[1] / this.mass];

        this.position[0] += this._velocity[0] + .5 * force[0] / this.mass;
        this.position[1] += this._velocity[1] + .5 * force[1] / this.mass;

        if (printInfo) {
            const tableInfo = {
                previousAccelleration: this._previousAcceleration,
                springForce: this._springForce,
                force: force,
                velocity: this._velocity,
                positionVector: [this.position[0] - this.base[0], this.position[1] - this.base[1]]
            }
            console.table(tableInfo);
        }
    }
}
