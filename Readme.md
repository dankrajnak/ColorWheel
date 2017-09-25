# APTE Color Wheel
An interactive splash element designed to possibly be used by Alleviating Poverty Through Entrepreneurship, a student group at OSU.

A majority of the work is done using d3.js, but I implemented my own Spring class, which simulates a spring according to Hooke's law,
and a poisson disk class which generates a uniform distribution of points in a given rectangle.  My implementation of this is
based of off Mike Bostock's which is in turn based off of Jason Davies [implementation](https://www.jasondavies.com/poisson-disc/).

A uniform distribution of points is created.  These points serve as the bases of springs.  A delaney triangle diagram is then generated
from these point-springs.  When moved, the mouse generates a force outward on the springs. Each frame, each spring's new position is calculated
and the delaney triangles are recalculated.  The triangles are then colored according to their position. 