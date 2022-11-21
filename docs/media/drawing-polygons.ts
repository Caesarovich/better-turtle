import { Turtle } from '../src';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';
import { join } from 'path';

// Create a stream to save image data
const outStream = createWriteStream(
  join(__dirname, '../', 'examples', 'drawing-polygons.png')
);

// Create a 2D canvas
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

ctx.antialias = 'none';

// Instanciate a new Turtle
const turtle = new Turtle(ctx as CanvasRenderingContext2D, {
  width: 6,
});

// Draw square
for (let i = 0; i < 4; i++) turtle.forward(100).right(90);

// Draw triangle
turtle.goto(-100, 50).setAngle(-90).setColor('green');

for (let i = 0; i < 4; i++) {
  turtle.forward(80).right(120);
}

// Draw pentagone
turtle.goto(0, -100).setAngle(-90).setColor('blue');

for (let i = 0; i < 5; i++) {
  turtle.forward(60).left(360 / 5);
}

//
turtle.hide();

// Write data onto PNG file
const stream = canvas.createPNGStream({});
stream.pipe(outStream);
