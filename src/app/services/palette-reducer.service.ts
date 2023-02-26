import {Injectable} from '@angular/core';
import {SplitRgbColor} from '../types/split-rgb-color';
import {ZxPalette} from '../models/zx-palette';

class ColorInfo {
  diff?: number;
  split?: SplitRgbColor;
}

interface SplitPalette {
  [key: string]: SplitRgbColor;
}

@Injectable({
  providedIn: 'root',
})
export class PaletteReducerService {
  private readonly splitPalette: SplitPalette;
  private imageData?: ImageData;
  private resultImageData?: ImageData;

  constructor() {
    this.splitPalette = {};
    for (const [code, color] of Object.entries(ZxPalette)) {
      this.splitPalette[code] = PaletteReducerService.splitRgb(color);
    }
  }

  public reducePalette(imageData: ImageData) {
    this.imageData = imageData;
    this.resultImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    );
    this.process();
    return this.resultImageData;
  }

  private process(): void {
    if (!this.imageData || !this.resultImageData) {
      return;
    }

    const colors = [];
    for (let y = 0; y < this.imageData.height; y++) {
      for (let x = 0; x < this.imageData.width; x++) {
        const closest = new ColorInfo();

        const imageColor = PaletteReducerService.imageColorAt(this.imageData, x, y);

        for (const color of Object.values(this.splitPalette)) {
          const diff = PaletteReducerService.colorDiff(imageColor, color);
          if (closest.diff === undefined || closest.diff > diff) {
            closest.diff = diff;
            closest.split = color;
          }
        }
        if (closest.split) {
          PaletteReducerService.imageSetPixel(this.resultImageData, x, y, closest.split);
        }
      }
    }
  };

  private static imageColorAt(imageData: ImageData, x: number, y: number): SplitRgbColor {
    const canvasCoordinate = (y * imageData.width + x) * 4;
    return [
      PaletteReducerService.sRgbToRgb(imageData.data[canvasCoordinate]),
      PaletteReducerService.sRgbToRgb(imageData.data[canvasCoordinate + 1]),
      PaletteReducerService.sRgbToRgb(imageData.data[canvasCoordinate + 2]),
    ];
  };

  private static imageSetPixel(imageData: ImageData, x: number, y: number, color: SplitRgbColor) {
    const canvasCoordinate = (y * imageData.width + x) * 4;

    imageData.data[canvasCoordinate] = PaletteReducerService.rgbToSrgb(color[0]);
    imageData.data[canvasCoordinate + 1] = PaletteReducerService.rgbToSrgb(color[1]);
    imageData.data[canvasCoordinate + 2] = PaletteReducerService.rgbToSrgb(color[2]);
    imageData.data[canvasCoordinate + 3] = 255;
  };

  private static colorDiff(rgb: SplitRgbColor, rgb2: SplitRgbColor) {
    return PaletteReducerService.simpleDiff(rgb[0], rgb[1], rgb[2], rgb2[0], rgb2[1], rgb2[2]);
  };

  private static simpleDiff(R1: number, G1: number, B1: number, R2: number, G2: number, B2: number) {
    const rMean = (R1 + R2) / 2;
    const r = R1 - R2;
    const g = G1 - G2;
    const b = B1 - B2;

    const weightR = 2 + rMean / 256;
    const weightG = 4.0;
    const weightB = 2 + (255 - rMean) / 256;
    return Math.sqrt(weightR * r * r + weightG * g * g + weightB * b * b);
  };

  private static splitRgb(rgb: number): SplitRgbColor {
    const r = PaletteReducerService.sRgbToRgb((rgb >> 16) & 0xFF);
    const g = PaletteReducerService.sRgbToRgb((rgb >> 8) & 0xFF);
    const b = PaletteReducerService.sRgbToRgb(rgb & 0xFF);
    return [r, g, b];
  };

  private static sRgbToRgb(color: number) {
    return color;
    return Math.round(
      Math.pow((color / 255 + 0.055) / (1 + 0.055), 2.4) * 255,
    );
  }

  private static rgbToSrgb(color: number) {
    return color;
    return Math.round(
      ((1 + 0.55) * Math.pow(color / 255, 1 / 2.4) - 0.055) * 255,
    );
  }
}
