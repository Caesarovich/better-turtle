import { Color, ColorResolvable, convertToColor } from './colors';
import {
  Vertex2D,
  rotateShape,
  degToRad,
  BuiltInShapes,
  resizeShape,
} from './shapes';

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
 * The different types of steps the turtle is making.
 */
export enum StepType {
  Forward,
  Left,
  Right,
  SetAngle,
  Hide,
  Show,
  PenUp,
  PenDown,
  Reset,
  Goto,
  SetColor,
  SetWidth,
}

type Step =
  | {
      type: StepType.Forward;
      args: [number];
    }
  | {
      type: StepType.Hide;
    }
  | {
      type: StepType.Show;
    }
  | {
      type: StepType.Left;
      args: [number];
    }
  | {
      type: StepType.Right;
      args: [number];
    }
  | {
      type: StepType.Goto;
      args: [number, number];
    }
  | {
      type: StepType.SetAngle;
      args: [number];
    }
  | {
      type: StepType.PenDown;
    }
  | {
      type: StepType.PenUp;
    }
  | {
      type: StepType.Reset;
    }
  | {
      type: StepType.SetWidth;
      args: [number];
    }
  | {
      type: StepType.SetColor;
      args: [ColorResolvable];
    };

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

  /**
   * Canvas Image data before drawing the turtle.
   */
  private preDrawData?: ImageData;

  /**
   * Wether or not the Turtle is in Step by Step mode.
   * Enabled using `.setSpeed`.
   */
  private stepByStep: boolean = false;

  /**
   * Wether or not the Turtle is currently perfoming a step.
   * Use `.inStep` instead.
   */
  private step: boolean = false;

  /**
   * The queue of steps do execute.
   */
  private steps: Step[] = [];

  /**
   * The delay in ms between each steps.
   */
  speed?: number;

  /**
   * The timer identifier for the step interval.
   */
  private interval?: ReturnType<typeof setInterval>;

  /**
   * The Color object representing the current color of the turtle.
   */
  private color: Color = new Color([255, 0, 255]);

  /**
   * The current width of the turtle's drawing.
   */
  private width: number = 1;

  /**
   * Wether or not the turtle is doing a step.
   */
  private get inStep(): boolean {
    if (!this.stepByStep) return true;
    return this.step;
  }

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
   * Execute a certain step.
   * @param step The step to execute
   */
  private doStep(step: Step): Turtle {
    // TODO: Make this correctly
    if (step.type === StepType.Goto) this.goto(...step.args);
    if (step.type === StepType.SetAngle) this.setAngle(...step.args);
    if (step.type === StepType.Forward) this.forward(...step.args);
    if (step.type === StepType.Left) this.left(...step.args);
    if (step.type === StepType.Right) this.right(...step.args);
    if (step.type === StepType.Hide) this.hide();
    if (step.type === StepType.Show) this.show();
    if (step.type === StepType.PenDown) this.putPenDown();
    if (step.type === StepType.PenUp) this.putPenUp();
    if (step.type === StepType.Reset) this.reset();
    if (step.type === StepType.SetColor) this.setColor(...step.args);
    if (step.type === StepType.SetWidth) this.setWidth(...step.args);

    return this;
  }

  /**
   * Execute the next step in the queue. Call this method to skip the interval.
   */
  private nextStep(): Turtle {
    const step = this.steps.shift();
    if (step) {
      this.step = true;
      this.doStep(step);
      this.step = false;
    } else if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    return this;
  }

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
    if (this.inStep) {
      this.hidden = true;
      this.restoreImageData();
      this.draw();
    } else this.steps.push({ type: StepType.Hide });
    return this;
  }

  /**
   * Show the turtle.
   */
  show(): Turtle {
    if (this.inStep) {
      this.hidden = false;
      this.draw();
    } else this.steps.push({ type: StepType.Show });
    return this;
  }

  /**
   * Reset the turtle and the canvas.
   */
  reset(): Turtle {
    if (this.inStep) {
      this.hidden = false;
      this.wrap = true;
      this.penDown = true;
      this.stepByStep = false;
      this.setWidth(1);
      this.setColor([0, 0, 0]);
      this.setAngle(0);
      this.goto(0, 0);
      this.clear();
    } else this.steps.push({ type: StepType.Reset });
    return this;
  }

  /**
   * Change the shape used to draw the turtle.
   *
   * @param shape An array of X/Y coordinates.
   */
  setShape(shape: Vertex2D[]): Turtle {
    this.shape = shape;
    this.draw();
    return this;
  }

  /**
   * Enable Step by Step mode and set the delay in ms between each steps.
   * @param ms The delay between each steps
   */
  setSpeed(ms: number): Turtle {
    this.stepByStep = ms > 0;
    this.speed = ms;

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(this.nextStep.bind(this), ms);

    return this;
  }

  /**
   * Puts the pen up to stop drawing.
   */
  putPenUp(): Turtle {
    if (this.inStep) {
      this.penDown = false;
    } else this.steps.push({ type: StepType.PenUp });
    return this;
  }

  /**
   * Puts the pen down to start drawing.
   */
  putPenDown(): Turtle {
    if (this.inStep) {
      this.penDown = true;
    } else this.steps.push({ type: StepType.PenDown });
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
    if (!this.inStep) {
      this.steps.push({ type: StepType.SetColor, args: [col] });
    } else this.color = convertToColor(col);
    return this;
  }

  /**
   * Sets a new width to be used for drawing lines.
   */
  setWidth(size: number): Turtle {
    if (!this.inStep) {
      this.steps.push({ type: StepType.SetWidth, args: [size] });
    } else this.width = size;
    return this;
  }

  /**
   * Set the turtle to this angle.
   */
  setAngle(ang: number): Turtle {
    if (this.inStep) {
      this.angle = ang;
      this.restoreImageData();
      this.draw();
    } else this.steps.push({ type: StepType.SetAngle, args: [ang] });
    return this;
  }

  /**
   * Rotate the turtle on the left.
   */
  left(ang: number): Turtle {
    if (this.inStep) {
      this.angle -= ang;
      this.restoreImageData();
      this.draw();
    } else this.steps.push({ type: StepType.Left, args: [ang] });
    return this;
  }

  /**
   * Rotate the turtle on the right.
   */
  right(ang: number): Turtle {
    if (this.inStep) {
      this.angle += ang;
      this.restoreImageData();
      this.draw();
    } else this.steps.push({ type: StepType.Right, args: [ang] });
    return this;
  }

  /**
   * Sends the turtle at a new position.
   */
  goto(x: number, y: number): Turtle {
    if (this.inStep) {
      this.position.x = x;
      this.position.y = y;
      this.restoreImageData();
      this.draw();
    } else this.steps.push({ type: StepType.Goto, args: [x, y] });
    return this;
  }

  /**
   * Draws the turtle (The arrow).
   */
  draw(): Turtle {
    this.saveImageData();
    if (this.hidden) return this;

    const proportionalSize = Math.max(this.width / 2, 1);

    const shape = rotateShape(
      resizeShape(this.shape, proportionalSize),
      this.angle
    );

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
    if (!this.inStep) {
      this.steps.push({ type: StepType.Forward, args: [distance] });
      return this;
    }

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

    this.step = true;
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
    this.step = false;
    return this;
  }

  /**
   * Expose the Turtle's methods onto an object.
   * This is very useful for example when using it with the `window` object,
   * abstracting method calls to simple functions calls.
   *
   * @param obj Any JavaScript Object
   */
  expose(obj: any): Turtle {
    obj.forward = this.forward.bind(this);
    obj.left = this.left.bind(this);
    obj.right = this.right.bind(this);
    obj.setAngle = this.setAngle.bind(this);
    obj.hide = this.hide.bind(this);
    obj.show = this.show.bind(this);
    obj.putPenUp = this.putPenUp.bind(this);
    obj.putPenDown = this.putPenDown.bind(this);
    obj.reset = this.reset.bind(this);
    obj.goto = this.goto.bind(this);
    obj.setColor = this.setColor.bind(this);
    obj.setWidth = this.setWidth.bind(this);
    return this;
  }

  constructor(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.draw();
  }
}
