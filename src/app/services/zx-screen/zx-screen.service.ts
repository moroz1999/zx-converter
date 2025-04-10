import {Injectable} from '@angular/core';
import {ColorInfo} from '../../models/color-info';
import {SplitRgbColor} from '../palette/split-rgb-color';
import {ZxPalette} from './zx-palette';
import {ZxScreen} from './zx-screen';
import {SplitPalette} from '../palette/split-palette';
import {PaletteSplitterService} from '../palette/palette-splitter.service';

@Injectable({
    providedIn: 'root',
})
export class ZxScreenService {
    private readonly pairColors: { [key: string]: string } = {
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
    private pixels: Array<Array<number>> = [];
    private attributes: Array<Array<string>> = [];

    constructor(
        private paletteSplitterService: PaletteSplitterService,
    ) {
        this.splitPalette = this.paletteSplitterService.splitPalette(ZxPalette);
    }

    public convertToScreen(imageData: ImageData): ZxScreen {
        this.imageData = imageData;
        this.pixels = [];
        this.attributes = [];

        let width = Math.ceil(imageData.width / 8);
        let height = Math.ceil(imageData.height / 8);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.processAttribute(x, y);
            }
        }
        return {
            pixels: this.pixels,
            attributes: this.attributes,
        };
    }

    private processAttribute(attrX: number, attrY: number): void {
        if (!this.imageData) {
            return;
        }

        let colors = [];
        for (let y = attrY * 8; y < attrY * 8 + 8; y++) {
            for (let x = attrX * 8; x < attrX * 8 + 8; x++) {
                let color = ZxScreenService.imageColorAt(this.imageData, x, y);
                colors.push({
                    'color': color,
                    'x': x,
                    'y': y,
                });
            }
        }

        let usedColorsIndex: { [key: string]: number } = {};
        for (let info of colors) {
            let closest = new ColorInfo();

            for (let [code, color] of Object.entries(this.splitPalette)) {
                let diff = ZxScreenService.colorDiff(info['color'], color);
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
            if (ZxScreenService.colorDiff(info['color'], this.splitPalette[maxColor]) < ZxScreenService.colorDiff(info['color'], this.splitPalette[minColor])) {
                this.setZxPixel(true, info['x'], info['y'], maxColor);
            } else {
                this.setZxPixel(false, info['x'], info['y'], minColor);
            }
        }
    };

    private setZxPixel(ink: boolean, x: number, y: number, colorCode: string): void {
        if (!this.pixels[y]) {
            this.pixels[y] = [];
        }
        this.pixels[y][x] = ink ? 1 : 0;

        let attrX = Math.floor(x / 8);
        let attrY = Math.floor(y / 8);
        if (!this.attributes[attrY]) {
            this.attributes[attrY] = [];
        }
        let attribute = '00000000';
        if (this.attributes[attrY][attrX]) {
            attribute = this.attributes[attrY][attrX];
        }

        let brightness;
        if (colorCode === '0000' || colorCode === '1000') {
            brightness = attribute.substring(1, 1);
        } else {
            brightness = colorCode.substring(0, 1);
        }

        if (ink) {
            attribute = '0' + brightness + attribute.substring(2, 3) + colorCode.substring(1, 3);
        } else {
            attribute = '0' + brightness + colorCode.substring(1, 3) + attribute.substring(5, 3);
        }
        this.attributes[attrY][attrX] = attribute;
    }

    private static imageColorAt(imageData: ImageData, x: number, y: number): SplitRgbColor {
        let canvasCoordinate = (y * imageData.width + x) * 4;
        return [
            imageData.data[canvasCoordinate], imageData.data[canvasCoordinate + 1],
            imageData.data[canvasCoordinate + 2],
        ];
    };

    private static colorDiff(rgb: SplitRgbColor, rgb2: SplitRgbColor) {
        return ZxScreenService.simpleDiff(rgb[0], rgb[1], rgb[2], rgb2[0], rgb2[1], rgb2[2]);
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

}
