import { Turtle } from '../src';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';
import { join } from 'path';

// Create a stream to save image data

const outStream = createWriteStream(
  join(__dirname, '../', 'examples', 'line-cap.png')
);

// Create a 2D canvas
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

ctx.antialias = 'none';

// Instanciate a new Turtle
const turtle = new Turtle(ctx as CanvasRenderingContext2D, {
  width: 20,
});

//
turtle.drawGrid(4);

turtle.setLineCap('butt').goto(-50, -50).forward(100);

turtle.setLineCap('square').goto(0, -50).forward(100);

turtle.setLineCap('round').goto(50, -50).forward(100);

turtle.hide();

// Write data onto PNG file
// Write data onto PNG file
const stream = canvas.createPNGStream();
stream.pipe(outStream);
