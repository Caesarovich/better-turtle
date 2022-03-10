import { createCanvas } from 'canvas';
import { Turtle } from './turtle';
import { createWriteStream } from 'fs';
import { join } from 'path';

const outStream = createWriteStream(join(__dirname, '/test.png'));
const canvas = createCanvas(500, 500);
const ctx = canvas.getContext('2d');

const turtle = new Turtle(ctx as CanvasRenderingContext2D);

turtle.setColor('red');
turtle.setWidth(1);
turtle.forward(50);
turtle.left(45);
turtle.forward(20);
turtle.right(30);
turtle.forward(10);

const stream = canvas.createPNGStream();

stream.pipe(outStream);
