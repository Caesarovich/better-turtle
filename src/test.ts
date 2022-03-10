import { createCanvas } from 'canvas';
import { Turtle } from './turtle';
import { createWriteStream } from 'fs';
import { join } from 'path';

const outStream = createWriteStream(join(__dirname, '/test.png'));
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

const turtle = new Turtle(ctx as CanvasRenderingContext2D);

turtle.setColor('blue').setWidth(1).left(5).forward(5700);

turtle.setColor('red').left(90).forward(6000);

turtle.setColor('green').right(30).forward(6000);
const stream = canvas.createPNGStream();

stream.pipe(outStream);
