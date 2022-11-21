import { Turtle } from '../src';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as GIFEncoder from 'gifencoder';

// Create a stream to save image data

const encoder = new GIFEncoder(400, 400);

const outStream = createWriteStream(
  join(__dirname, '../', 'examples', 'grid.gif')
);

encoder.createReadStream().pipe(outStream);

encoder.start();
encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
encoder.setDelay(1000); // frame delay in ms
encoder.setQuality(10); // image quality. 10 is default.
encoder.setTransparent(1);
// Create a 2D canvas
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

ctx.antialias = 'none';

// Instanciate a new Turtle
const turtle = new Turtle(ctx as CanvasRenderingContext2D, {
  width: 12,
  lineCap: 'butt',
});

//
turtle.clear().drawGrid(2);
encoder.addFrame(ctx);
turtle.clear().drawGrid(3);
encoder.addFrame(ctx);
turtle.clear().drawGrid(4);
encoder.addFrame(ctx);
turtle.clear().drawGrid(5);
encoder.addFrame(ctx);
turtle.clear().drawGrid(6);
encoder.addFrame(ctx);
turtle.clear().drawGrid(7);
encoder.addFrame(ctx);
turtle.clear().drawGrid(8);
encoder.addFrame(ctx);

// Write data onto PNG file
encoder.finish();
