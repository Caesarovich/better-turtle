import { EventEmitter } from 'events';
import { Color, ColorArray, ColorResolvable, convertToColor } from './colors';
import { Vertex2D, rotateShape, degToRad, BuiltInShapes, resizeShape } from './shapes';
import { TurtleEvents, StepType, Step } from './steps';

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
 * The different styles of the end caps for drawn lines.
 *
 * @note The value "round" and "square" make the lines slightly longer.
 *
 * @see https://www.w3schools.com/TAgs/canvas_linecap.asp
 */
export type LineCap = 'butt' | 'round' | 'square';

/**
 * Represents a remapping of method's names when exposing them onto a JavaScript object.
 *
 * @see {@link Turtle.expose}
 */

export interface ExposeRemap {
  forward?: string;
  left?: string;
  right?: string;
  hide?: string;
  show?: string;
  putPenUp?: string;
  putPenDown?: string;
  clear?: string;
  reset?: string;
  goto?: string;
  setAngle?: string;
  setColor?: string;
  setWidth?: string;
  setDelay?: string;
  setShape?: string;
  setLineCap?: string;
}

/**
 * A set of options to apply to a Turtle instance.
 */
export interface TurtleOptions {
  /**
   * Wether the turtle should be hidden.
   *
   * @default false
   */
  hidden?: boolean;

  /**
   * Wether or not to disable wrapping the turtle around the canvas.
   * The turtle goes around when overflowing.
   *
   * @default false
   */
  disableWrapping?: boolean;

  /**
   * The default drawing color.
   *
   * @default '[255, 0, 255]'
   */
  defaultColor?: ColorResolvable;

  /**
   * The default drawing width.
   *
   * @default 2
   */
  width?: number;

  /**
   * The position on which to start drawing.
   *
   * @default '{x: 0, y: 0}'
   */
  startPostition?: Vertex2D;

  /**
   * The angle at which to start drawing.
   *
   * @default 0
   */
  startAngle?: number;

  /**
   * The shape of the turtle.
   *
   * @default BuiltInShapes.Default
   */
  shape?: Vertex2D[];

  /**
   * The default lineCap value.
   *
   * @default 'round'
   */
  lineCap?: LineCap;
}

export interface Turtle {
  on<U extends keyof TurtleEvents>(event: U, listener: TurtleEvents[U]): this;
  emit<U extends keyof TurtleEvents>(event: U, ...args: Parameters<TurtleEvents[U]>): boolean;
}

/**
 * A Turtle to draw on a canvas.
 * 
 * @example
 * ```ts
    // Instanciate a new Turtle
    const turtle = new Turtle(ctx as CanvasRenderingContext2D, {
      width: 6,
    });

    // Draw square
    for (let i = 0; i < 4; i++) turtle.forward(100).right(90);

    // Draw triangle
    turtle.goto(-100, 50).setAngle(-90).setColor('green');

    for (let i = 0; i < 4; i++) {
      turtle.forward(80).right(120);
    }

    // Draw pentagone
    turtle.goto(0, -100).setAngle(-90).setColor('blue');

    for (let i = 0; i < 5; i++) {
      turtle.forward(60).left(360 / 5);
    }

    //
    turtle.hide();
 * ```
 * ![Turtle drawing](https://caesarovich.github.io/better-turtle/media/drawing-polygons.png)
 */
export class Turtle extends EventEmitter {
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
   * Enabled using {@link Turtle.setDelay}.
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
  delay?: number;

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
   * The current lineCap value of the Canvas.
   */

  private set lineCap(cap: LineCap) {
    this.ctx.lineCap = cap;
  }

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
  private position: Vertex2D = { x: 0, y: 0 };

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
   *
   * @param step The step to execute
   * @returns {Turtle} For method chaining.
   */
  private doStep(step: Step): Turtle {
    this.emit('step', step);
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
    if (step.type === StepType.Clear) this.clear();
    if (step.type === StepType.SetColor) this.setColor(...step.args);
    if (step.type === StepType.SetWidth) this.setWidth(...step.args);
    if (step.type === StepType.SetDelay) this.setDelay(...step.args);
    if (step.type === StepType.SetShape) this.setShape(...step.args);
    if (step.type === StepType.SetLineCap) this.setLineCap(...step.args);

    return this;
  }

  /**
   * Execute the next step in the queue. Call this method to skip the interval.
   *
   * @returns {Turtle} For method chaining.
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
   * Resets the interval with the current delay.
   */
  private resetInterval() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(this.nextStep.bind(this), this.delay);
  }

  /**
   *  Add a step to the queue.
   */
  private addStep(step: Step): Turtle {
    this.steps.push(step);
    if (!this.interval) this.resetInterval();
    return this;
  }

  /**
   * Wipes out the canvas.
   *
   * @returns {Turtle} For method chaining.
   */
  clear(): Turtle {
    if (this.inStep) {
      this.emit('clear');
      clearContext(this.ctx);
      this.draw();
    } else this.addStep({ type: StepType.Clear });

    return this;
  }

  /**
   * Hide the turtle.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   *```ts
    turtle.hide();

    turtle.show();
   * ```
   * ![Hide-Show illustration](https://caesarovich.github.io/better-turtle/media/hide-show.gif)
   */
  hide(): Turtle {
    if (this.inStep) {
      this.emit('hide');
      this.hidden = true;
      this.restoreImageData();
      this.draw();
    } else this.addStep({ type: StepType.Hide });
    return this;
  }

  /**
   * Show the turtle.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   *```ts
    turtle.hide();

    turtle.show();
   * ```
   * ![Hide-Show illustration](https://caesarovich.github.io/better-turtle/media/hide-show.gif)
   */
  show(): Turtle {
    if (this.inStep) {
      this.emit('show');
      this.hidden = false;
      this.draw();
    } else this.addStep({ type: StepType.Show });
    return this;
  }

  /**
   * Reset the turtle and the canvas.
   *
   * @returns {Turtle} For method chaining.
   */
  reset(): Turtle {
    if (this.inStep) {
      this.emit('reset');
      this.hidden = false;
      this.wrap = true;
      this.penDown = true;
      this.stepByStep = false;
      this.setWidth(1);
      this.setColor([0, 0, 0]);
      this.setAngle(0);
      this.goto(0, 0);
      this.clear();
    } else this.addStep({ type: StepType.Reset });
    return this;
  }

  /**
   * Change the shape used to draw the turtle.
   *
   * @param shape An array of X/Y coordinates.
   * @returns {Turtle} For method chaining.
   */
  setShape(shape: Vertex2D[]): Turtle {
    if (this.inStep) {
      this.emit('setShape', shape);
      this.shape = shape;
      this.draw();
    } else this.addStep({ type: StepType.SetShape, args: [shape] });
    return this;
  }

  /**
   * @deprecated Use {@link Turtle.setDelay} instead.
   */
  setSpeed(ms: number): Turtle {
    return this.setDelay(ms);
  }

  /**
   * Enable Step by Step mode and set the delay in ms between each steps.
   *
   * @param ms The delay between each steps
   * @returns {Turtle} For method chaining.
   */
  setDelay(ms: number): Turtle {
    if (this.inStep) {
      this.emit('setDelay', ms);
      this.stepByStep = ms > 0;
      this.delay = ms;

      this.resetInterval();
    } else this.addStep({ type: StepType.SetDelay, args: [ms] });
    return this;
  }

  /**
   * Puts the pen up to stop drawing.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    turtle.forward(100);

    turtle.putPenUp();

    turtle.forward(100);

    turtle.putPenDown();

    turtle.forward(100);
   * ```
   * ![Pen Up-Down illustration](https://caesarovich.github.io/better-turtle/media/pen-up-down.gif)
   */
  putPenUp(): Turtle {
    if (this.inStep) {
      this.emit('putPenUp');
      this.penDown = false;
    } else this.addStep({ type: StepType.PenUp });
    return this;
  }

  /**
   * Puts the pen down to start drawing.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    turtle.forward(100);

    turtle.putPenUp();

    turtle.forward(100);

    turtle.putPenDown();

    turtle.forward(100);
   * ```
   * ![Pen Up-Down illustration](https://caesarovich.github.io/better-turtle/media/pen-up-down.gif)
   */
  putPenDown(): Turtle {
    if (this.inStep) {
      this.emit('putPenDown');
      this.penDown = true;
    } else this.addStep({ type: StepType.PenDown });
    return this;
  }

  /**
   * Inverts the position of the pen.
   *
   * @returns {Turtle} For method chaining.
   */
  invertPen(): Turtle {
    this.penDown = !this.penDown;
    return this;
  }

  /**
   * Sets a new color to be used for drawing.
   *
   * @param red The red value of the color.
   * @param green The green value of the color.
   * @param blue The blue value of the color.
   * @param alpha The alpha value of the color.
   *
   * @returns {Turtle} For method chaining.
   *
   * @example
   * ```ts
   * turtle.setColor(255, 0, 0); // red
   *
   * turtle.setColor(0, 255, 0, 0.5); // semi-transparent green
   * ```
   */
  setColor(red: number, green: number, blue: number, alpha?: number): Turtle;
  /**
   * Sets a new color to be used for drawing.
   *
   * @param color Any value resolvable to a color.
   *
   * @returns {Turtle} For method chaining.
   *
   * @example
   * ```ts
   * turtle.setColor('red'); // red
   *
   * turtle.setColor([0, 255, 0]); // green
   *
   * turtle.setColor('#ffffff'); // white
   * ```
   */
  setColor(color: ColorResolvable): Turtle;
  setColor(...colors: ColorArray | [ColorResolvable]): Turtle {
    let color: ColorResolvable = [0, 0, 0];
    if (colors.length >= 3) {
      // Check if it was rest arguments
      color = colors as ColorArray;
    } else if (typeof colors[0] !== 'number') {
      // Type guard
      color = colors[0];
    }

    if (this.inStep) {
      this.emit('setColor', color);
      this.color = convertToColor(color);
      this.restoreImageData();
      this.draw();
    } else this.addStep({ type: StepType.SetColor, args: [color] });
    return this;
  }

  /**
   * Sets a new width to be used for drawing lines.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    turtle.setWidth(2).goto(-100, -50).forward(100);

    turtle.setWidth(4).goto(-50, -50).forward(100);

    turtle.setWidth(8).goto(0, -50).forward(100);

    turtle.setWidth(16).goto(50, -50).forward(100);

    turtle.setWidth(32).goto(100, -50).forward(100);
   * ```
   * ![Width illustration](https://caesarovich.github.io/better-turtle/media/width.gif)
   */
  setWidth(size: number): Turtle {
    if (this.inStep) {
      this.emit('setWidth', size);
      this.width = size;
      this.restoreImageData();
      this.draw();
    } else this.addStep({ type: StepType.SetWidth, args: [size] });
    return this;
  }

  /**
   * Change the line cap style of the lines being drawn.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @see {@link LineCap}
   * 
   * @example
   * ```ts
    turtle.setLineCap('butt').goto(-50, -50).forward(100);

    turtle.setLineCap('square').goto(0, -50).forward(100);

    turtle.setLineCap('round').goto(50, -50).forward(100);
   * ```
   * ![Pen Up-Down illustration](https://caesarovich.github.io/better-turtle/media/line-cap.png)
   */
  setLineCap(cap: LineCap): Turtle {
    if (this.inStep) {
      this.emit('setLineCap', cap);
      this.lineCap = cap;
    } else this.addStep({ type: StepType.SetLineCap, args: [cap] });
    return this;
  }

  /**
   * Set the turtle to this angle.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    for (let i = 0; i < 360; i += 15) {
      turtle.setAngle(i);
    }
   * ```
   * ![Set Angle illustration](https://caesarovich.github.io/better-turtle/media/angle.gif)
   */
  setAngle(ang: number): Turtle {
    if (this.inStep) {
      this.emit('setAngle', ang);
      this.angle = ang;
      this.restoreImageData();
      this.draw();
    } else this.addStep({ type: StepType.SetAngle, args: [ang] });
    return this;
  }

  /**
   * Rotate the turtle on the left.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    turtle.forward(100);

    turtle.left(45);

    turtle.forward(100);

    turtle.left(45);

    turtle.forward(100);
   * ```
   * ![Left illustration](https://caesarovich.github.io/better-turtle/media/left.gif)
   */
  left(ang: number): Turtle {
    if (this.inStep) {
      this.emit('left', ang);
      this.angle -= ang;
      this.restoreImageData();
      this.draw();
    } else this.addStep({ type: StepType.Left, args: [ang] });
    return this;
  }

  /**
   * Rotate the turtle on the right.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    turtle.forward(100);

    turtle.right(45);

    turtle.forward(100);

    turtle.right(45);

    turtle.forward(100);
   * ```
   * ![Right illustration](https://caesarovich.github.io/better-turtle/media/right.gif)
   */
  right(ang: number): Turtle {
    if (this.inStep) {
      this.emit('right', ang);
      this.angle += ang;
      this.restoreImageData();
      this.draw();
    } else this.addStep({ type: StepType.Right, args: [ang] });
    return this;
  }

  /**
   * Sends the turtle at a new position.
   *
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
      turtle.goto(0, 0);

      turtle.goto(0, -150);

      turtle.goto(0, 150);

      turtle.goto(150, 0);

      turtle.goto(-150, 0);
   * ```
   * ![Goto illustration](https://caesarovich.github.io/better-turtle/media/goto.gif)
   */
  goto(x: number, y: number): Turtle {
    if (this.inStep) {
      this.emit('goto', x, y);
      this.position.x = x;
      this.position.y = y;
      this.restoreImageData();
      this.draw();
    } else this.addStep({ type: StepType.Goto, args: [x, y] });
    return this;
  }

  /**
   * Draws the turtle (The arrow).
   *
   * @returns {Turtle} For method chaining.
   */
  draw(): Turtle {
    this.saveImageData();
    if (this.hidden) return this;

    const proportionalSize = Math.max(this.width / 2, 1);

    const shape = rotateShape(resizeShape(this.shape, proportionalSize), this.angle);

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

    this.ctx.fillStyle = this.color.toHex();
    this.ctx.fill();
    this.ctx.lineWidth = Math.max(this.width / 4, 1);
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
    this.ctx.restore();
    return this;
  }

  /**
   * Saves the current image into {@link Turtle.preDrawData}.
   *
   * @returns {Turtle} For method chaining.
   */
  saveImageData(): Turtle {
    this.preDrawData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    return this;
  }

  /**
   * Restores the image from {@link Turtle.preDrawData}.
   *
   * @returns {Turtle} For method chaining.
   */
  restoreImageData(): Turtle {
    if (this.preDrawData) this.ctx.putImageData(this.preDrawData, 0, 0);
    return this;
  }

  /**
   * Makes the turtle walk forward and draw a line.
   *
   * @param distance The distance in pixels for the turtle to travel.
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    turtle.goto(-50, -100).forward(50);

    turtle.goto(0, -100).forward(100);

    turtle.goto(50, -100).forward(150);
   * ```
   * ![Forward illustration](https://caesarovich.github.io/better-turtle/media/forward.gif)
   */
  forward(distance: number): Turtle {
    if (!this.inStep) {
      this.addStep({ type: StepType.Forward, args: [distance] });
      return this;
    }

    this.emit('forward', distance);
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
   * @returns {Turtle} For method chaining.
   * 
   * @example
   * ```ts
    turtle.clear().drawGrid(2);
    turtle.clear().drawGrid(3);
    turtle.clear().drawGrid(4);
    turtle.clear().drawGrid(5);
    turtle.clear().drawGrid(6);
    turtle.clear().drawGrid(7);
    turtle.clear().drawGrid(8);
   * ```
   * ![Draw grid illustration](https://caesarovich.github.io/better-turtle/media/grid.gif)
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
   * @param remap A remap object to remap method's names
   * @returns {Turtle} For method chaining.
   */
  expose(obj: any, remap?: ExposeRemap): Turtle {
    obj[remap?.forward ?? 'forward'] = this.forward.bind(this);
    obj[remap?.left ?? 'left'] = this.left.bind(this);
    obj[remap?.right ?? 'right'] = this.right.bind(this);
    obj[remap?.setAngle ?? 'setAngle'] = this.setAngle.bind(this);
    obj[remap?.hide ?? 'hide'] = this.hide.bind(this);
    obj[remap?.show ?? 'show'] = this.show.bind(this);
    obj[remap?.putPenUp ?? 'putPenUp'] = this.putPenUp.bind(this);
    obj[remap?.putPenDown ?? 'putPenDown'] = this.putPenDown.bind(this);
    obj[remap?.reset ?? 'reset'] = this.reset.bind(this);
    obj[remap?.clear ?? 'clear'] = this.clear.bind(this);
    obj[remap?.goto ?? 'goto'] = this.goto.bind(this);
    obj[remap?.setColor ?? 'setColor'] = this.setColor.bind(this);
    obj[remap?.setWidth ?? 'setWidth'] = this.setWidth.bind(this);
    obj[remap?.setShape ?? 'setShape'] = this.setShape.bind(this);
    obj[remap?.setDelay ?? 'setDelay'] = this.setDelay.bind(this);
    obj[remap?.setLineCap ?? 'setLineCap'] = this.setLineCap.bind(this);
    return this;
  }

  constructor(context: CanvasRenderingContext2D, options?: TurtleOptions) {
    super();
    this.ctx = context;
    this.lineCap = 'round';

    if (options?.hidden) this.hidden = options.hidden;
    if (options?.disableWrapping) this.wrap = !options.disableWrapping;
    if (options?.defaultColor) this.color = convertToColor(options.defaultColor);
    if (options?.width) this.width = options.width;
    if (options?.startPostition) this.position = options.startPostition;
    if (options?.startAngle) this.angle = options.startAngle;
    if (options?.shape) this.shape = options.shape;
    if (options?.lineCap) this.lineCap = options.lineCap;
  }
}
