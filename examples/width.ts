import { Turtle } from '../src';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as GIFEncoder from 'gifencoder';

// Create a stream to save image data

const encoder = new GIFEncoder(300, 300);

const outStream = createWriteStream(join(__dirname, '../', 'examples', 'width.gif'));

encoder.createReadStream().pipe(outStream);

encoder.start();
encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
encoder.setDelay(1000); // frame delay in ms
encoder.setQuality(10); // image quality. 10 is default.
encoder.setTransparent(1);
// Create a 2D canvas
const canvas = createCanvas(300, 300);
const ctx = canvas.getContext('2d');

ctx.antialias = 'none';

// Instanciate a new Turtle
const turtle = new Turtle(ctx as unknown as CanvasRenderingContext2D, {
  lineCap: 'butt',
  hidden: true,
});

//
turtle.setWidth(2).goto(-100, -50).forward(100);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.setWidth(4).goto(-50, -50).forward(100);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.setWidth(8).goto(0, -50).forward(100);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.setWidth(16).goto(50, -50).forward(100);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
turtle.setWidth(32).goto(100, -50).forward(100);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);

// Write data onto PNG file
encoder.finish();
