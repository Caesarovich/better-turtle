import { HTMLColorName, toHex } from './html-colors';

/**
 * A class for color manipulation.
 */
export class Color {
  /**
   * The `red` component of the color.
   */
  private r: number = 0;

  /**
   * The `green` component of the color.
   */
  private g: number = 0;

  /**
   * The `blue` component of the color.
   */
  private b: number = 0;

  /**
   * The `alpha` component of the color (opacity).
   *
   * Ranges from 0 to 1.
   */
  private a: number = 1;

  /**
   * Get the RGB value of the color as an array of integers.
   */

  get rgba(): ColorArray {
    return [this.r, this.g, this.b, this.a];
  }

  /**
   * Set the RGB value of the color as an array of integers.
   */
  set rgba([r, g, b, a]) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a ?? 1;
  }

  /**
   * Convert the color to an hexademical string.
   *
   * @example `#f6d26a`
   *
   * @param noHashtag Wether to not include the `#` character in the string.
   */
  toHex(noHashtag?: boolean): string {
    let str = noHashtag ? '' : '#';

    str += this.r.toString(16).padStart(2, '0');
    str += this.g.toString(16).padStart(2, '0');
    str += this.b.toString(16).padStart(2, '0');

    return str;
  }

  /**
   * Convert the color to a `rgb(...)` css string.
   *
   * @example `rgb(250, 30, 124)`
   *
   */
  toRGB(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  /**
   * Convert the color to a `rgba(...)` css string.
   *
   * @example `rgba(250, 30, 124, 0.5)`
   *
   */
  toRGBA(): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  constructor(rgba: ColorArray) {
    this.rgba = rgba;
  }
}

export function isHTMLColorName(col: string): col is HTMLColorName {
  return toHex(col as HTMLColorName) != null;
}

export type ColorArray = [number, number, number, number?];

/**
 * A value that can be resolved into a Color instance.
 *
 * - It can be a **Color** instance itself
 * - An HTML color name as a string (https://www.w3schools.com/colors/colors_names.asp/)
 * - An **array of three to four integers** representing RGB(A) values
 * - An **hexadecimal string** representation of the RGB(A) value (eg. '#FF15DE')
 */
export type ColorResolvable = Color | HTMLColorName | ColorArray | string;

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

// Write a function that converts a hex string to a RGBA array

function parseHex(hex: string): [number, number, number, number] {
  if (hex[0] == '#') hex = hex.slice(1, 9);

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = parseInt(hex.slice(6, 8), 16);

  return [r, g, b, a];
}

/**
 * Convert a value to a **Color** instance.
 *
 * @param col The value to convert.
 */

export function convertToColor(col: ColorResolvable): Color {
  if (col instanceof Color) return col;
  let rgb: ColorArray = [0, 0, 0, 1];

  if (Array.isArray(col)) {
    rgb = col;
  } else {
    col = col.trim().toLowerCase();
    if (isHTMLColorName(col)) col = toHex(col);
    rgb = parseHex(col);
  }

  // Clamp values or default them
  rgb[0] = Math.floor(clamp(!isNaN(rgb[0]) ? rgb[0] : 0, 0, 255));
  rgb[1] = Math.floor(clamp(!isNaN(rgb[1]) ? rgb[1] : 0, 0, 255));
  rgb[2] = Math.floor(clamp(!isNaN(rgb[2]) ? rgb[2] : 0, 0, 255));
  rgb[3] = clamp(!isNaN(rgb[3]!) ? rgb[3]! : 1, 0, 1);

  return new Color(rgb);
}
