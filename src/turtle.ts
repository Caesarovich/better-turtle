import { Color, ColorResolvable, convertToColor } from './colors';

function clearContext(context: CanvasRenderingContext2D) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.restore();
}

function insideCanvas(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const w = ctx.canvas.width / 2;
  const h = ctx.canvas.height / 2;

  return x >= -w && x <= w && y >= -h && y <= h;
}

function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

function centerCoordinates(ctx: CanvasRenderingContext2D) {
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.transform(1, 0, 0, -1, 0, 0);
}

export class Turtle {
  canvas: HTMLCanvasElement;
  /**
   * The turtle's Canvas 2D context.
   */
  ctx: CanvasRenderingContext2D;

  redraw: boolean = true;

  hidden: boolean = false;

  wrap: boolean = true;

  penDown: boolean = true;

  stepByStep: boolean = false;

  //private step: boolean = false;

  //private steps: [string, string][] = [];

  speed?: number;

  interval?: TimerHandler;

  color: Color = new Color([255, 0, 255]);

  width: number = 1;

  position: {
    x: number;
    y: number;
  } = { x: 0, y: 0 };

  angle: number = 0;

  forward(distance: number): void {
    this.ctx.save();
    centerCoordinates(this.ctx);
    this.ctx.beginPath();
    const cosAngle = Math.cos(degToRad(this.angle));
    const sinAngle = Math.sin(degToRad(this.angle));
    const w = this.ctx.canvas.width / 2;
    const h = this.ctx.canvas.height / 2;

    let x = this.position.x;
    let y = this.position.y;
    let newX = x + sinAngle * distance;
    let newY = y + cosAngle * distance;

    if (!this.wrap || !insideCanvas(this.ctx, newX, newY)) {
      this.ctx.lineTo(newX, newY);
    } else {
      while (distance > 0) {
        this.ctx.moveTo(x, y);

        if (Math.abs(newX) > w) {
          x -= x;
          const distanceToEdge = Math.abs((w - x) / sinAngle);
          y += cosAngle * distanceToEdge;
          this.ctx.lineTo(newX, newY);
          newX += newX < 0 ? w : -w;
          distance -= distanceToEdge;
        } else if (Math.abs(newY) > h) {
          y -= y;
          const distanceToEdge = Math.abs((h - y) / cosAngle);
          x += sinAngle * distanceToEdge;
          this.ctx.lineTo(newX, newY);
          newY += newY < 0 ? h : -h;
          distance -= distanceToEdge;
        } else {
          this.ctx.lineTo(newX, newY);
          distance = 0;
        }
      }
    }

    this.position.x = newX;
    this.position.y = newY;

    if (this.penDown) this.ctx.stroke();
    this.ctx.restore();
    this.draw();
  }

  clear(): void {
    clearContext(this.ctx);
    this.draw();
  }

  hide(): void {
    this.hidden = true;
    this.draw();
  }

  show(): void {
    this.hidden = false;
    this.draw();
  }

  reset(): void {
    this.redraw = true;
    this.hidden = false;
    this.wrap = true;
    this.penDown = true;
    this.stepByStep = false;
    this.width = 1;
    this.color = new Color([255, 0, 255]);
    this.angle = 0;
    this.position = {
      x: 0,
      y: 0,
    };
    this.clear();
    this.draw();
  }

  putPenUp(): void {
    this.penDown = false;
  }

  putPenDown(): void {
    this.penDown = true;
  }

  invertPen(): void {
    this.penDown = !this.penDown;
  }

  setColor(col: ColorResolvable): void {
    this.color = convertToColor(col);
  }
  setWidth(size: number): void {
    this.width = size;
  }

  setAngle(ang: number): void {
    this.angle = ang;
    this.draw();
  }

  left(ang: number): void {
    this.angle -= ang;
    this.draw();
  }

  right(ang: number): void {
    this.angle += ang;
    this.draw();
  }

  goto(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.draw();
  }

  draw(): void {
    if (!this.redraw) return;
    //clearContext(this.ctx);
    if (!this.hidden) {
      // const x = this.position.x;
      // const y = this.position.y;
      // var w = 10;
      // var h = 15;
      //   turtleContext.save();
      //   centerCoords(turtleContext);
      //   turtleContext.translate(x, y);
      //   turtleContext.rotate(-turtle.angle);
      //   turtleContext.translate(-x, -y);
      //   turtleContext.beginPath();
      //   turtleContext.moveTo(x - w / 2, y);
      //   turtleContext.lineTo(x + w / 2, y);
      //   turtleContext.lineTo(x, y + h);
      //   turtleContext.closePath();
      //   turtleContext.fillStyle = 'green';
      //   turtleContext.fill();
      //   turtleContext.restore();
    }
    // Make a composite of the turtle canvas and the image canvas.
    //turtleContext.drawImage(imageCanvas, 0, 0, 700, 700, 0, 0, 700, 700);
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.ctx = ctx;
    } else throw new Error('Could not get 2D context on HTMLCanvasElement');
  }
}
