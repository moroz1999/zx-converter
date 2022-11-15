import {ColorInfo, SplitRgbColor} from '../models/color-info';

type StringKeyIndex<T> = { [key: string]: T }

interface SplitPalette {
  [key: string]: SplitRgbColor;
}

export class PaletteReducer {
  private readonly zxPalette: StringKeyIndex<number> = {
    '0000': 0x000000,
    '0001': 0x0000CD,
    '0010': 0xCD0000,
    '0011': 0xCD00CD,
    '0100': 0x00CD00,
    '0101': 0x00CDCD,
    '0110': 0xCDCD00,
    '0111': 0xCDCDCD,

    '1000': 0x000000,
    '1001': 0x0000FF,
    '1010': 0xFF0000,
    '1011': 0xFF00FF,
    '1100': 0x00FF00,
    '1101': 0x00FFFF,
    '1110': 0xFFFF00,
    '1111': 0xFFFFFF,
  };
  private readonly pairColors: StringKeyIndex<string> = {
    '0000': '1000',
    '0001': '1001',
    '0010': '1010',
    '0011': '1011',
    '0100': '1100',
    '0101': '1101',
    '0110': '1110',
    '0111': '1111',

    '1000': '0000',
    '1001': '0001',
    '1010': '0010',
    '1011': '0011',
    '1100': '0100',
    '1101': '0101',
    '1110': '0110',
    '1111': '0111',
  };
  private readonly splitPalette: SplitPalette;
  private imageData?: ImageData;
  private resultImageData?: ImageData;
  public pixelsData: Array<Array<number>> = [];
  public attributesData: Array<Array<string>> = [];

  constructor() {
    this.splitPalette = {};
    for (let [code, color] of Object.entries(this.zxPalette)) {
      this.splitPalette[code] = PaletteReducer.splitRgb(color);
    }
  }

  reducePalette(imageData: ImageData, resultImageData: ImageData) {
    this.imageData = imageData;
    this.resultImageData = resultImageData;
    this.pixelsData = [];
    this.attributesData = [];

    let width = Math.ceil(imageData.width / 8);
    let height = Math.ceil(imageData.height / 8);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.processAttribute(x, y);
      }
    }
    return resultImageData;
  }

  private processAttribute(attrX: number, attrY: number): void {
    if (!this.imageData || !this.resultImageData) {
      return;
    }

    let colors = [];
    for (let y = attrY * 8; y < attrY * 8 + 8; y++) {
      for (let x = attrX * 8; x < attrX * 8 + 8; x++) {
        let color = PaletteReducer.imageColorAt(this.imageData, x, y);
        colors.push({
          'color': color,
          'x': x,
          'y': y,
        });
      }
    }

    let usedColorsIndex: StringKeyIndex<number> = {};
    for (let info of colors) {
      let closest = new ColorInfo();

      for (let [code, color] of Object.entries(this.splitPalette)) {
        let diff = PaletteReducer.colorDiff(info['color'], color);
        if (closest.diff === undefined || closest.diff > diff) {
          closest.diff = diff;
          closest.color = color;
          closest.code = code;
        }
      }
      if (closest.code !== undefined) {
        if (typeof usedColorsIndex[closest.code] === 'undefined') {
          usedColorsIndex[closest.code] = 0;
        }
        usedColorsIndex[closest.code]++;
      }
    }

    let usedColors = [];
    for (let [code, count] of Object.entries(usedColorsIndex)) {
      usedColors.push({'code': code, 'count': count});
    }

    usedColors.sort(function (a, b) {
      return b.count - a.count;
    });

    let minColor;
    let maxColor = usedColors.shift()?.code || '0000';

    if (usedColors.length > 0) {
      minColor = usedColors.shift()?.code || '0000';
      if (maxColor && this.pairColors[maxColor] == minColor) {
        if (usedColors.length > 0) {
          minColor = usedColors.shift()?.code || '0000';
        } else {
          minColor = maxColor;
        }
      }
    } else {
      minColor = maxColor;
    }

    for (let i in colors) {
      let info = colors[i];
      if (PaletteReducer.colorDiff(info['color'], this.splitPalette[maxColor]) < PaletteReducer.colorDiff(info['color'], this.splitPalette[minColor])) {
        PaletteReducer.imageSetPixel(this.resultImageData, info['x'], info['y'], this.splitPalette[maxColor]);
        this.setChrdPixel(true, info['x'], info['y'], maxColor);
      } else {
        PaletteReducer.imageSetPixel(this.resultImageData, info['x'], info['y'], this.splitPalette[minColor]);
        this.setChrdPixel(false, info['x'], info['y'], minColor);
      }
    }
  };

  private setChrdPixel(ink: boolean, x: number, y: number, colorCode: string): void {
    if (!this.pixelsData[y]) {
      this.pixelsData[y] = [];
    }
    this.pixelsData[y][x] = ink ? 1 : 0;

    let attrX = Math.floor(x / 8);
    let attrY = Math.floor(y / 8);
    if (!this.attributesData[attrY]) {
      this.attributesData[attrY] = [];
    }
    let attribute = '00000000';
    if (this.attributesData[attrY][attrX]) {
      attribute = this.attributesData[attrY][attrX];
    }

    let brightness;
    if (colorCode === '0000' || colorCode === '1000') {
      brightness = attribute.substr(1, 1);
    } else {
      brightness = colorCode.substr(0, 1);
    }

    if (ink) {
      attribute = '0' + brightness + attribute.substr(2, 3) + colorCode.substr(1, 3);
    } else {
      attribute = '0' + brightness + colorCode.substr(1, 3) + attribute.substr(5, 3);
    }
    this.attributesData[attrY][attrX] = attribute;
  }

  private static imageColorAt(imageData: ImageData, x: number, y: number): SplitRgbColor {
    let canvasCoordinate = (y * imageData.width + x) * 4;
    return [
      imageData.data[canvasCoordinate], imageData.data[canvasCoordinate + 1],
      imageData.data[canvasCoordinate + 2],
    ];
  };

  private static imageSetPixel(imageData: ImageData, x: number, y: number, color: SplitRgbColor) {
    let canvasCoordinate = (y * imageData.width + x) * 4;

    imageData.data[canvasCoordinate] = color[0];
    imageData.data[canvasCoordinate + 1] = color[1];
    imageData.data[canvasCoordinate + 2] = color[2];
    imageData.data[canvasCoordinate + 3] = 255;
  };

  private static colorDiff(rgb: SplitRgbColor, rgb2: SplitRgbColor) {
    return PaletteReducer.simpleDiff(rgb[0], rgb[1], rgb[2], rgb2[0], rgb2[1], rgb2[2]);
  };

  private static simpleDiff(R1: number, G1: number, B1: number, R2: number, G2: number, B2: number) {
    let rMean = (R1 + R2) / 2;
    let r = R1 - R2;
    let g = G1 - G2;
    let b = B1 - B2;

    let weightR = 2 + rMean / 256;
    let weightG = 4.0;
    let weightB = 2 + (255 - rMean) / 256;
    return Math.sqrt(weightR * r * r + weightG * g * g + weightB * b * b);
  };

  private static splitRgb(rgb: number): SplitRgbColor {
    let r = (rgb >> 16) & 0xFF;
    let g = (rgb >> 8) & 0xFF;
    let b = rgb & 0xFF;

    return [r, g, b];
  };
}
