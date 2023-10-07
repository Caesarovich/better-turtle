import { Turtle } from '../src';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as GIFEncoder from 'gifencoder';

// Create a stream to save image data

const encoder = new GIFEncoder(400, 400);

const outStream = createWriteStream(join(__dirname, '../', 'examples', 'goto.gif'));

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
const turtle = new Turtle(ctx as unknown as CanvasRenderingContext2D, {
  width: 12,
  lineCap: 'butt',
});

turtle.drawGrid(8);

//
turtle.goto(0, 0);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.goto(0, -150);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.goto(0, 150);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.goto(150, 0);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.goto(-150, 0);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);

// Write data onto PNG file
encoder.finish();
