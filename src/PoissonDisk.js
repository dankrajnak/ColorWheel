//author: Daniel Krajnak
class PoissonDisk {
    constructor(width, height, radius) {
        this.width = width;
        this.height = height;
        this.radius = radius;
    }

    generatePoints() {
        let points = [],
            activeSamples = [],
            numberToCheck = 30;
        // Add first point
        activeSamples.push([Math.random() * this.width, Math.random() * this.height]);

        while (activeSamples.length > 0) {
            //Get random active sample
            let activeSamplesIndex = Math.floor(Math.random() * activeSamples.length)
            let sample = activeSamples[activeSamplesIndex]

            //Generate new point within the annulus (r to 2r from sample)
            let newPoint = this._newPointInAnnulus(sample);
            let validPoint = false;
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

    _newPointInAnnulus(point) {
        const x = point[0],
            y = point[1];
        const dist = Math.random() * this.radius + this.radius;
        const angle = Math.random() * Math.PI * 2;
        const dx = dist * Math.cos(angle);
        const dy = dist * Math.sin(angle);
        return [x + dx, y + dy];
    }

    _pointIsValid(point, samples) {
        if (point[0] < -this.radius || point[0] > this.width + this.radius) {
            return false;
        }

        if (point[1] < -this.radius || point[1] > this.height + this.radius) {
            return false;
        }
        let valid = true

        samples.forEach((sample) => {
            if (Math.sqrt(Math.pow(point[0] - sample[0], 2) + Math.pow(point[1] - sample[1], 2)) < this.radius) {
                valid = false;
                return; //exit forEach
            }
        })
        return valid;
    }
}
