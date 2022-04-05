import { createCanvas } from 'canvas';
import { Turtle } from './turtle';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { BuiltInShapes } from './shapes';

const outStream = createWriteStream(join(__dirname, '/test.png'));
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

const turtle = new Turtle(ctx as CanvasRenderingContext2D, {
  disableWrapping: true,
  shape: BuiltInShapes.Triangle,
});

turtle
  .expose(globalThis, {
    right: 'riight',
    left: 'lleft',
  })

  .hide()
  .setColor('red')
  .setWidth(8)
  .goto(0, 0)
  .setAngle(0)
  .forward(100)
  .show()
  .left(90)
  .forward(50)
  .left(90)
  .forward(100)
  .left(70)
  .hide()
  .forward(50)
  .right(90);

const stream = canvas.createPNGStream();

stream.pipe(outStream);
