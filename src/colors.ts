import { hex, HTMLColorName } from './html-colors';

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

  get rgb(): [number, number, number] {
    return [this.r, this.g, this.b];
  }

  /**
   * Set the RGB value of the color as an array of integers.
   */
  set rgb([r, g, b]) {
    this.r = r;
    this.g = g;
    this.b = b;
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

  constructor(rgb: [number, number, number]) {
    this.rgb = rgb;
  }
}

export function isHTMLColorName(col: string): col is HTMLColorName {
  return hex(col as HTMLColorName) != null;
}
/**
 * A value that can be resolved into a Color instance.
 *
 * - It can be a **Color** instance itself
 * - An HTML color name as a string (https://www.w3schools.com/colors/colors_names.asp/)
 * - An **array of three integers** representing RGB values
 * - An **hexadecimal string** representation of the RGB value (eg. '#FF15DE')
 */
export type ColorResolvable =
  | Color
  | HTMLColorName
  | [number, number, number]
  | string;

export function convertToColor(col: ColorResolvable): Color {
  if (col instanceof Color) return col;
  let rgb: [number, number, number] = [0, 0, 0];

  if (Array.isArray(col)) {
    rgb = [...col];
    rgb[0] ??= 0;
    rgb[1] ??= 0;
    rgb[2] ??= 0;
  } else {
    col = col.trim().toLowerCase();
    if (hex(col as HTMLColorName)) col = hex(col as HTMLColorName) as string;
    if (col[0] == '#') col = col.slice(1, 7);

    if (col.length >= 6) {
      rgb[0] = parseInt(col.slice(0, 2), 16);
      rgb[1] = parseInt(col.slice(2, 4), 16);
      rgb[2] = parseInt(col.slice(4, 6), 16);
    } else {
      rgb[0] = parseInt(col[0] ?? '0', 16);
      rgb[1] = parseInt(col[1] ?? '0', 16);
      rgb[2] = parseInt(col[2] ?? '0', 16);
    }
  }

  rgb[0] = rgb[0] < 0 ? 0 : rgb[0] > 255 ? 255 : rgb[0];
  rgb[1] = rgb[1] < 0 ? 0 : rgb[1] > 255 ? 255 : rgb[1];
  rgb[2] = rgb[2] < 0 ? 0 : rgb[2] > 255 ? 255 : rgb[2];

  return new Color(rgb);
}
