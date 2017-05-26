<!-- using shields.io for status buttons -->
![Programming Language](https://img.shields.io/badge/Language-Javascript-black.svg)
![Grade](https://img.shields.io/badge/Grade-100-brightgreen.svg)


# Rotating Pendulum using WebGL
CSCE 4230 - Computer Graphics, Assignment 2

## Assignment
Write a WebGL program that displays a rotating pendulum. The pendulum bob is free to rotate through 360 degrees about an anchor point at the center of the canvas using [Matsuda and Lea](https://sites.google.com/site/webglbook/)'s textbook example [RotatingTriangle_withButtons](http://rodger.global-linguist.com/webgl/ch04/RotatingTriangle_withButtons.html) as a template. The pendulum has the following three components:
* The anchor point is a green square centered at the origin (0,0) with point size = 5 pixels.
* The bob is a blue hexagon of radius r = 0.1 rendered with a triangle fan centered at the origin (along with a ModelView matrix that translates and rotates).
* The bob is attached to the anchor point by a rigid red wire of length l = 0.8.

Use global variables for the point size of the anchor, the radius of the bob, the length of the wire, and the angular velocity of rotation in degrees per second.  Set the initial angular velocity to 45 and allow an interactive user to increase or decrease the value in multiples of 10 degrees per second with button presses.
		
## Notes
Discovered matrices in order to get one to be static and another rotating. I also added extra buttons with more control of the animation. Also, this isn't actually a pendulum; that is just what the assignment was called.

## Demo
The implementation can be viewed [here](https://mnl.space/Rotating-Pendulum-WebGL/).
