import { Turtle } from '../src';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';
import { join } from 'path';

// Create a stream to save image data
const outStream = createWriteStream(join(__dirname, '../', 'examples', 'drawing-circle.png'));

// Create a 2D canvas
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

ctx.antialias = 'none';

// Instanciate a new Turtle
const turtle = new Turtle(ctx as unknown as CanvasRenderingContext2D, {
  width: 6,
  defaultColor: 'red',
});

// Draw circle

turtle.goto(-100, 0);

for (let i = 0; i < 360; i++) {
  turtle.forward(2).right(1);
}

//
turtle.hide();

// Write data onto PNG file
const stream = canvas.createPNGStream();
stream.pipe(outStream);
