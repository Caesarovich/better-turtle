import { Color, ColorResolvable, convertToColor } from './colors';

function clearContext(context: CanvasRenderingContext2D) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.restore();
}

function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

function centerCoordinates(ctx: CanvasRenderingContext2D) {
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.transform(1, 0, 0, -1, 0, 0);
}

export class Turtle {
  /**
   * The turtle's Canvas 2D context.
   */
  readonly ctx: CanvasRenderingContext2D;

  private redraw: boolean = true;

  private hidden: boolean = false;

  private wrap: boolean = true;

  private penDown: boolean = true;

  //private stepByStep: boolean = false;

  //private step: boolean = false;

  //private steps: [string, string][] = [];

  //private speed?: number;

  //private interval?: TimerHandler;

  private color: Color = new Color([255, 0, 255]);

  private width: number = 1;

  private position: {
    x: number;
    y: number;
  } = { x: 0, y: 0 };

  private angle: number = 0;

  clear(): Turtle {
    clearContext(this.ctx);
    this.draw();
    return this;
  }

  hide(): Turtle {
    this.hidden = true;
    this.draw();
    return this;
  }

  show(): Turtle {
    this.hidden = false;
    this.draw();
    return this;
  }

  reset(): Turtle {
    this.redraw = true;
    this.hidden = false;
    this.wrap = true;
    this.penDown = true;
    //this.stepByStep = false;
    this.setWidth(1);
    this.setColor([0, 0, 0]);
    this.setAngle(0);
    this.goto(0, 0);
    this.clear();
    this.draw();
    return this;
  }

  putPenUp(): Turtle {
    this.penDown = false;
    return this;
  }

  putPenDown(): Turtle {
    this.penDown = true;
    return this;
  }

  invertPen(): Turtle {
    this.penDown = !this.penDown;
    return this;
  }

  setColor(col: ColorResolvable): Turtle {
    this.color = convertToColor(col);
    return this;
  }
  setWidth(size: number): Turtle {
    this.width = size;
    return this;
  }

  setAngle(ang: number): Turtle {
    this.angle = ang;
    this.draw();
    return this;
  }

  left(ang: number): Turtle {
    this.angle -= ang;
    this.draw();
    return this;
  }

  right(ang: number): Turtle {
    this.angle += ang;
    this.draw();
    return this;
  }

  goto(x: number, y: number): Turtle {
    this.position.x = x;
    this.position.y = y;
    this.draw();
    return this;
  }

  draw(): Turtle {
    if (!this.redraw) return this;
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
    return this;
  }

  forward(distance: number): Turtle {
    this.ctx.save();
    centerCoordinates(this.ctx);
    this.ctx.lineWidth = this.width;
    this.ctx.strokeStyle = this.color.toRGBA();
    if (this.penDown) this.ctx.beginPath();
    const cosAngle = Math.cos(degToRad(this.angle));
    const sinAngle = Math.sin(degToRad(this.angle));
    const w = this.ctx.canvas.width / 2;
    const h = this.ctx.canvas.height / 2;

    let x = this.position.x;
    let y = this.position.y;
    let newX = x + sinAngle * distance;
    let newY = y + cosAngle * distance;

    this.ctx.moveTo(x, y);

    while (distance > 0) {
      const distanceToEdgeX = Math.abs((newX > x ? w - x : w + x) / sinAngle);
      const distanceToEdgeY = Math.abs((newY > y ? h - y : h + y) / cosAngle);
      console.log(`
      distance: ${distance},
      newX: ${newX},  x: ${x}
      newY: ${newY},  y: ${y}
      cosAngle: ${cosAngle}, sinAngle: ${sinAngle}
      `);
      this.ctx.moveTo(x, y);

      if (
        this.wrap &&
        Math.abs(newX) > w &&
        distanceToEdgeX <= distanceToEdgeY
      ) {
        console.log('xwrap');
        x = newX > 0 ? -w : w;
        y += cosAngle * distanceToEdgeX;
        this.ctx.lineTo(newX, newY);
        newX -= newX > 0 ? w * 2 : -(w * 2);
        distance -= distanceToEdgeX;
      } else if (
        this.wrap &&
        Math.abs(newY) > h &&
        distanceToEdgeX >= distanceToEdgeY
      ) {
        console.log('y wrap');
        y = newY > 0 ? -h : h;
        x += sinAngle * distanceToEdgeY;
        this.ctx.lineTo(newX, newY);
        newY -= newY > 0 ? h * 2 : -(h * 2);
        distance -= distanceToEdgeY;
      } else {
        this.ctx.lineTo(newX, newY);
        distance = 0;
      }
    }

    this.goto(newX, newY);

    if (this.penDown) this.ctx.stroke();
    this.ctx.restore();
    this.draw();
    return this;
  }

  constructor(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.reset();
  }
}
