import { convertToColor } from '../src/colors';

describe('convert HTML color names', () => {
  test('conversion to hex', () => {
    expect(convertToColor('red').toHex()).toBe('#ff0000');
    expect(convertToColor('green').toHex()).toBe('#008000');
    expect(convertToColor('blue').toHex()).toBe('#0000ff');
    expect(convertToColor('yellow').toHex()).toBe('#ffff00');
    expect(convertToColor('white').toHex()).toBe('#ffffff');
    expect(convertToColor('black').toHex()).toBe('#000000');
  });

  test('conversion to rgb', () => {
    expect(convertToColor('red').toRGB()).toBe('rgb(255, 0, 0)');
    expect(convertToColor('green').toRGB()).toBe('rgb(0, 128, 0)');
    expect(convertToColor('blue').toRGB()).toBe('rgb(0, 0, 255)');
    expect(convertToColor('yellow').toRGB()).toBe('rgb(255, 255, 0)');
    expect(convertToColor('white').toRGB()).toBe('rgb(255, 255, 255)');
    expect(convertToColor('black').toRGB()).toBe('rgb(0, 0, 0)');
  });

  test('conversion to rgba', () => {
    expect(convertToColor('red').toRGBA()).toBe('rgba(255, 0, 0, 1)');
    expect(convertToColor('green').toRGBA()).toBe('rgba(0, 128, 0, 1)');
    expect(convertToColor('blue').toRGBA()).toBe('rgba(0, 0, 255, 1)');
    expect(convertToColor('yellow').toRGBA()).toBe('rgba(255, 255, 0, 1)');
    expect(convertToColor('white').toRGBA()).toBe('rgba(255, 255, 255, 1)');
    expect(convertToColor('black').toRGBA()).toBe('rgba(0, 0, 0, 1)');
  });

  // Invalid color names should return black
  test('conversion with invalid color name', () => {
    expect((convertToColor('invalid') as any).toHex()).toBe('#000000');
  });

  test('conversion with unsanitized color name', () => {
    expect(convertToColor('  red  ').toHex()).toBe('#ff0000');
    expect(convertToColor('GREEN').toHex()).toBe('#008000');
    expect(convertToColor('  BLUE').toHex()).toBe('#0000ff');
    expect(convertToColor('  yellOw  ').toHex()).toBe('#ffff00');
    expect(convertToColor('  WHiTE  ').toHex()).toBe('#ffffff');
    expect(convertToColor('  black  ').toHex()).toBe('#000000');
  });
});

describe('convert array of rgb values', () => {
  test('conversion to hex', () => {
    expect(convertToColor([255, 0, 0]).toHex()).toBe('#ff0000');
    expect(convertToColor([0, 128, 0]).toHex()).toBe('#008000');
    expect(convertToColor([0, 0, 255]).toHex()).toBe('#0000ff');
    expect(convertToColor([255, 255, 0]).toHex()).toBe('#ffff00');
    expect(convertToColor([255, 255, 255]).toHex()).toBe('#ffffff');
    expect(convertToColor([0, 0, 0]).toHex()).toBe('#000000');
  });

  test('conversion to rgb', () => {
    expect(convertToColor([255, 0, 0]).toRGB()).toBe('rgb(255, 0, 0)');
    expect(convertToColor([0, 128, 0]).toRGB()).toBe('rgb(0, 128, 0)');
    expect(convertToColor([0, 0, 255]).toRGB()).toBe('rgb(0, 0, 255)');
    expect(convertToColor([255, 255, 0]).toRGB()).toBe('rgb(255, 255, 0)');
    expect(convertToColor([255, 255, 255]).toRGB()).toBe('rgb(255, 255, 255)');
    expect(convertToColor([0, 0, 0]).toRGB()).toBe('rgb(0, 0, 0)');
  });

  test('conversion to rgba', () => {
    expect(convertToColor([255, 0, 0]).toRGBA()).toBe('rgba(255, 0, 0, 1)');
    expect(convertToColor([0, 128, 0]).toRGBA()).toBe('rgba(0, 128, 0, 1)');
    expect(convertToColor([0, 0, 255]).toRGBA()).toBe('rgba(0, 0, 255, 1)');
    expect(convertToColor([255, 255, 0]).toRGBA()).toBe('rgba(255, 255, 0, 1)');
    expect(convertToColor([255, 255, 255]).toRGBA()).toBe('rgba(255, 255, 255, 1)');
    expect(convertToColor([0, 0, 0]).toRGBA()).toBe('rgba(0, 0, 0, 1)');
  });
});

describe('convert array of rgba values', () => {
  test('conversion to hex', () => {
    expect(convertToColor([255, 0, 0, 1]).toHex()).toBe('#ff0000');
    expect(convertToColor([0, 128, 0, 1]).toHex()).toBe('#008000');
    expect(convertToColor([0, 0, 255, 1]).toHex()).toBe('#0000ff');
    expect(convertToColor([255, 255, 0, 1]).toHex()).toBe('#ffff00');
    expect(convertToColor([255, 255, 255, 1]).toHex()).toBe('#ffffff');
    expect(convertToColor([0, 0, 0, 1]).toHex()).toBe('#000000');
  });

  test('conversion to rgb', () => {
    expect(convertToColor([255, 0, 0, 1]).toRGB()).toBe('rgb(255, 0, 0)');
    expect(convertToColor([0, 128, 0, 1]).toRGB()).toBe('rgb(0, 128, 0)');
    expect(convertToColor([0, 0, 255, 1]).toRGB()).toBe('rgb(0, 0, 255)');
    expect(convertToColor([255, 255, 0, 1]).toRGB()).toBe('rgb(255, 255, 0)');
    expect(convertToColor([255, 255, 255, 1]).toRGB()).toBe('rgb(255, 255, 255)');
    expect(convertToColor([0, 0, 0, 1]).toRGB()).toBe('rgb(0, 0, 0)');
  });

  test('conversion to rgba', () => {
    expect(convertToColor([255, 0, 0, 1]).toRGBA()).toBe('rgba(255, 0, 0, 1)');
    expect(convertToColor([0, 128, 0, 0]).toRGBA()).toBe('rgba(0, 128, 0, 0)');
    expect(convertToColor([0, 0, 255, 0.5]).toRGBA()).toBe('rgba(0, 0, 255, 0.5)');
    expect(convertToColor([255, 255, 0, 0.25]).toRGBA()).toBe('rgba(255, 255, 0, 0.25)');
    expect(convertToColor([255, 255, 255, 0.1]).toRGBA()).toBe('rgba(255, 255, 255, 0.1)');
    expect(convertToColor([0, 0, 0, 0.8]).toRGBA()).toBe('rgba(0, 0, 0, 0.8)');
  });

  test('conversion with invalid array sizes', () => {
    expect(convertToColor([1, 64] as any).toHex()).toBe('#014000');
    expect(convertToColor([1] as any).toHex()).toBe('#010000');
    expect(convertToColor([] as any).toHex()).toBe('#000000');
    expect(convertToColor([1, 64, 128, 256, 16, 32] as any).toHex()).toBe('#014080');
  });

  test('conversion with overflowing rgb values', () => {
    expect(convertToColor([257, 0, -5, 2]).toRGBA()).toBe('rgba(255, 0, 0, 1)');
  });

  test('conversion with unsanitized array values', () => {
    expect(convertToColor([128.1212, 0.5, 0.5]).toHex()).toBe('#800000');
    expect(convertToColor([0.5, 128.1212, 0.5]).toHex()).toBe('#008000');
    expect(convertToColor([0.5, 0.5, 128.1212]).toHex()).toBe('#000080');
    expect(convertToColor([128.1212, 128.1212, 0.5]).toRGB()).toBe('rgb(128, 128, 0)');
    expect(convertToColor([128.1212, 128.1212, 128.1212, 0.5]).toRGBA()).toBe(
      'rgba(128, 128, 128, 0.5)',
    );
    expect(convertToColor([0.5, 0.5, 0.5]).toHex()).toBe('#000000');
  });
});

describe('convert hex string', () => {
  test('conversion to hex', () => {
    expect(convertToColor('#ff0000').toHex()).toBe('#ff0000');
    expect(convertToColor('#008000').toHex()).toBe('#008000');
    expect(convertToColor('#0000ff').toHex()).toBe('#0000ff');
    expect(convertToColor('#ffff00').toHex()).toBe('#ffff00');
    expect(convertToColor('#ffffff').toHex()).toBe('#ffffff');
    expect(convertToColor('#000000').toHex()).toBe('#000000');
  });

  test('conversion to rgb', () => {
    expect(convertToColor('#ff0000').toRGB()).toBe('rgb(255, 0, 0)');
    expect(convertToColor('#008000').toRGB()).toBe('rgb(0, 128, 0)');
    expect(convertToColor('#0000ff').toRGB()).toBe('rgb(0, 0, 255)');
    expect(convertToColor('#ffff00').toRGB()).toBe('rgb(255, 255, 0)');
    expect(convertToColor('#ffffff').toRGB()).toBe('rgb(255, 255, 255)');
    expect(convertToColor('#000000').toRGB()).toBe('rgb(0, 0, 0)');
  });

  test('conversion to rgba', () => {
    expect(convertToColor('#ff000000').toRGBA()).toBe('rgba(255, 0, 0, 0)');
    expect(convertToColor('#008000ff').toRGBA()).toBe('rgba(0, 128, 0, 1)');
    expect(convertToColor('#0000ffcc').toRGBA()).toBe('rgba(0, 0, 255, 0.8)');
    expect(convertToColor('#ffff000f').toRGBA()).toBe('rgba(255, 255, 0, 0.05)');
    expect(convertToColor('#ffffffaa').toRGBA()).toBe('rgba(255, 255, 255, 0.66)');
    expect(convertToColor('#00000000').toRGBA()).toBe('rgba(0, 0, 0, 0)');
  });

  test('conversion with invalid hex string', () => {
    expect((convertToColor('#invalid') as any).toHex()).toBe('#000000');
  });

  test('conversion with unsanitized hex string', () => {
    expect(convertToColor('  #ff0000  ').toHex()).toBe('#ff0000');
    expect(convertToColor('  #008000  ').toHex()).toBe('#008000');
    expect(convertToColor('  #0000Ff  ').toHex()).toBe('#0000ff');
    expect(convertToColor('  #ffff00  ').toHex()).toBe('#ffff00');
    expect(convertToColor('  #fFFfff  ').toHex()).toBe('#ffffff');
    expect(convertToColor('  #000000  ').toHex()).toBe('#000000');
  });
});
