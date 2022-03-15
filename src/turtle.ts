import { Color, ColorResolvable, convertToColor } from './colors';
import { Vertex2D, rotateShape, degToRad, BuiltInShapes } from './shapes';

/**
 * Clears a canvas.
 */
function clearContext(context: CanvasRenderingContext2D) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.restore();
}

function centerCoordinates(ctx: CanvasRenderingContext2D): void {
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.transform(1, 0, 0, -1, 0, 0);
}

/**
 * A Turtle to draw on a canvas.
 */
export class Turtle {
  /**
   * The turtle's Canvas 2D context.
   */
  readonly ctx: CanvasRenderingContext2D;

  /**
   * Wether or not the turtle is hidden.
   */
  private hidden: boolean = false;

  /**
   * Wether or not to wrap the turtle around the canvas.
   * The turtle goes around when overflowing.
   */
  private wrap: boolean = true;

  /**
   * Determines if the turtle draws on the canvas or not.
   */
  private penDown: boolean = true;

  /** */
  private preDrawData?: ImageData;

  //private stepByStep: boolean = false;

  //private step: boolean = false;

  //private steps: [string, string][] = [];

  //private speed?: number;

  //private interval?: TimerHandler;

  /**
   * The Color object representing the current color of the turtle.
   */
  private color: Color = new Color([255, 0, 255]);

  /**
   * The current width of the turtle's drawing.
   */
  private width: number = 1;

  /**
   * The current X/Y position of the turtle on the canvas.
   */
  private position: {
    x: number;
    y: number;
  } = { x: 0, y: 0 };

  /**
   * The current angle of the turtle.
   */
  private angle: number = 0;

  /**
   * The shape of the turtle which is drawn with the `.draw` method.
   *
   * Represented by an array of 2D vertices (X/Y coordinates) defining
   * the boundaries of the shape.
   */
  private shape: Vertex2D[] = BuiltInShapes.Default;

  /**
   * Wipes out the canvas.
   * @returns {Turtle} For method chaining.
   */
  clear(): Turtle {
    clearContext(this.ctx);
    this.draw();
    return this;
  }

  /**
   * Hide the turtle.
   */
  hide(): Turtle {
    this.hidden = true;
    this.draw();
    return this;
  }

  /**
   * Show the turtle.
   */
  show(): Turtle {
    this.hidden = false;
    this.draw();
    return this;
  }

  /**
   * Reset the turtle and the canvas.
   */
  reset(): Turtle {
    this.hidden = false;
    this.wrap = true;
    this.penDown = true;
    //this.stepByStep = false;
    this.setWidth(1);
    this.setColor([0, 0, 0]);
    this.setAngle(0);
    this.goto(0, 0);
    this.clear();
    return this;
  }

  /**
   * Puts the pen up to stop drawing.
   */
  putPenUp(): Turtle {
    this.penDown = false;
    return this;
  }

  /**
   * Puts the pen down to start drawing.
   */
  putPenDown(): Turtle {
    this.penDown = true;
    return this;
  }

  /**
   * Inverts the position of the pen.
   */
  invertPen(): Turtle {
    this.penDown = !this.penDown;
    return this;
  }

  /**
   * Sets a new color to be used for drawing.
   * @param col Any value resolvable to a color.
   */
  setColor(col: ColorResolvable): Turtle {
    this.color = convertToColor(col);
    return this;
  }

  /**
   * Sets a new width to be used for drawing lines.
   */
  setWidth(size: number): Turtle {
    this.width = size;
    return this;
  }

  /**
   * Set the turtle to this angle.
   */
  setAngle(ang: number): Turtle {
    this.angle = ang;
    this.restoreImageData();
    this.draw();
    return this;
  }

  /**
   * Rotate the turtle on the left.
   */
  left(ang: number): Turtle {
    this.angle -= ang;
    this.restoreImageData();
    this.draw();
    return this;
  }

  /**
   * Rotate the turtle on the right.
   */
  right(ang: number): Turtle {
    this.angle += ang;
    this.restoreImageData();
    this.draw();
    return this;
  }

  /**
   * Sends the turtle at a new position.
   */
  goto(x: number, y: number): Turtle {
    this.position.x = x;
    this.position.y = y;
    this.restoreImageData();
    this.draw();
    return this;
  }

  /**
   * Draws the turtle (The arrow).
   */
  draw(): Turtle {
    this.saveImageData();
    if (this.hidden) return this;

    const shape = rotateShape(this.shape, this.angle);

    const x = this.position.x;
    const y = this.position.y;

    this.ctx.save();
    centerCoordinates(this.ctx);

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    for (let i = 0; i < shape.length; i++) {
      const vertex = shape[i];
      if (vertex) this.ctx.lineTo(x + vertex.x, y + vertex.y);
    }
    this.ctx.closePath();

    this.ctx.fillStyle = 'green';
    this.ctx.fill();
    this.ctx.restore();
    return this;
  }

  /**
   * Saves the current image into `.preDrawData`.
   */
  saveImageData(): Turtle {
    this.preDrawData = this.ctx.getImageData(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height
    );

    return this;
  }

  /**
   * Restores the image from `.preDrawData`.
   */
  restoreImageData(): Turtle {
    if (this.preDrawData) this.ctx.putImageData(this.preDrawData, 0, 0);
    return this;
  }

  /**
   * Makes the turtle walk forward and draw a line.
   *
   * @param distance The distance in pixels for the turtle to travel.
   */
  forward(distance: number): Turtle {
    this.restoreImageData();
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

      this.ctx.moveTo(x, y);
      if (
        // Crossing X boundaries
        this.wrap &&
        Math.abs(newX) > w &&
        distanceToEdgeX <= distanceToEdgeY
      ) {
        x = newX > 0 ? -w : w;
        y += cosAngle * distanceToEdgeX;
        this.ctx.lineTo(newX, newY);
        newX -= newX > 0 ? w * 2 : -(w * 2);
        distance -= distanceToEdgeX;
      } else if (
        // Crossing Y boundaries
        this.wrap &&
        Math.abs(newY) > h &&
        distanceToEdgeX >= distanceToEdgeY
      ) {
        y = newY > 0 ? -h : h;
        x += sinAngle * distanceToEdgeY;
        this.ctx.lineTo(newX, newY);
        newY -= newY > 0 ? h * 2 : -(h * 2);
        distance -= distanceToEdgeY;
      } else {
        // Does not cross any boundary
        this.ctx.lineTo(newX, newY);
        distance = 0;
      }
    }

    if (this.penDown) this.ctx.stroke();
    this.ctx.restore();
    this.saveImageData();
    this.goto(newX, newY);
    return this;
  }

  /**
   * Draws a grid on the Canvas. Pretty useful to be precise.
   *
   * @param separations The number of separations on the grid.
   */
  drawGrid(separations: number): Turtle {
    // Make it minimum 2
    separations = Math.max(2, separations);

    const oldAngle = this.angle;
    const oldColor = this.color;
    const oldWidth = this.width;
    const oldX = this.position.x;
    const oldY = this.position.y;
    const w = this.ctx.canvas.width;
    const h = this.ctx.canvas.height;

    this.setColor('grey');
    this.setWidth(2);

    for (let i = 1; i < separations; i++) {
      this.setAngle(90);
      this.goto(-(w / 2), h - (h / separations) * i - h / 2);
      this.forward(w);
      this.setAngle(180);
      this.goto(w - (w / separations) * i - w / 2, h / 2);
      this.forward(h);
    }

    this.setAngle(oldAngle);
    this.setColor(oldColor);
    this.setWidth(oldWidth);
    this.goto(oldX, oldY);
    this.ctx.restore();
    return this;
  }

  constructor(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.draw();
  }
}
