import { ColorResolvable } from './colors';
import { Vertex2D } from './shapes';
import { LineCap } from './turtle';

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
  Clear,
  Goto,
  SetColor,
  SetWidth,
  SetShape,
  SetDelay,
  SetLineCap,
}

export type Step =
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
      type: StepType.Clear;
    }
  | {
      type: StepType.SetWidth;
      args: [number];
    }
  | {
      type: StepType.SetDelay;
      args: [number];
    }
  | {
      type: StepType.SetColor;
      args: [ColorResolvable];
    }
  | {
      type: StepType.SetShape;
      args: [Vertex2D[]];
    }
  | {
      type: StepType.SetLineCap;
      args: [LineCap];
    };

export interface TurtleEvents {
  /**
   * Emitted at every steps when StepByStep mode is enabled.
   *
   * @see {@link Turtle.stepByStep}
   */
  step: (step: Step) => void;
  clear: () => void;
  hide: () => void;
  show: () => void;
  reset: () => void;
  setShape: (shape: Vertex2D[]) => void;
  setDelay: (ms: number) => void;
  putPenUp: () => void;
  putPenDown: () => void;
  setColor: (color: ColorResolvable) => void;
  setWidth: (width: number) => void;
  setLineCap: (cap: LineCap) => void;
  setAngle: (angle: number) => void;
  left: (angle: number) => void;
  right: (angle: number) => void;
  goto: (x: number, y: number) => void;
  forward: (distance: number) => void;
}
