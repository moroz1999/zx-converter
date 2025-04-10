import {Injectable} from '@angular/core';
import {PaletteSplitterService} from './palette/palette-splitter.service';
import {ZxPalette} from './zx-screen/zx-palette';
import {SplitPalette} from './palette/split-palette';
import {SplitRgbColor} from './palette/split-rgb-color';

@Injectable({
    providedIn: 'root',
})
export class BorderReaderService {
    private readonly splitPalette: SplitPalette;

    constructor(
        private paletteSplitterService: PaletteSplitterService,
    ) {
        this.splitPalette = this.paletteSplitterService.splitPalette(ZxPalette);
    }


    public parseBorder(image: ImageData): Uint8Array {
        // one border pixel is 8*1 real pixels
        const top = this.readBPixelsWindow(image, 0, 0, 48, 64);
        const left = this.readBPixelsWindow(image, 0, 64, 8, 192);
        const right = this.readBPixelsWindow(image, 32 + 8, 64, 8, 192);
        const bottom = this.readBPixelsWindow(image, 0, 64 + 192, 48, 48);
        const bytes = [] as Array<number>;

        for (let i = 0; i < 64; i++) {
            this.compileBytes(top[i], 48, bytes);
        }
        for (let i = 0; i < 192; i++) {
            this.compileBytes(left[i], 8, bytes);
            this.compileBytes(right[i], 8, bytes);
        }
        for (let i = 0; i < 48; i++) {
            this.compileBytes(bottom[i], 48, bytes);
        }
        return Uint8Array.from(bytes);
    }

    private compileBytes(data: Array<string>, length: number, bytes: Array<number>) {
        for (let p = 0; p < data.length; p = p + 2) {
            const left = data[p];
            const right = data[p + 1];
            bytes.push(
                parseInt('00' + right + left, 2),
            );
        }
    }

    private readBPixelsWindow(image: ImageData, sx: number, sy: number, w: number, h: number): Array<Array<string>> {
        const bPixelsWindow = new Array<Array<string>>();
        for (let y = sy; y < sy + h; y++) {
            const row = new Array<string>();
            for (let x = sx; x < sx + w; x++) {
                let foundCode = '000';
                const usedColorsCount = {} as { [key: string]: number };

                const pointer = (y * image.width + x * 8) * 4;
                for (let fx = 0; fx < 8; fx++) {
                    const colorCode = this.readPixel(image, pointer + fx * 4);

                    if (usedColorsCount[colorCode] === undefined) {
                        usedColorsCount[colorCode] = 0;
                    }
                    usedColorsCount[colorCode]++;
                }
                let currentCount = 0;

                for (const code of Object.keys(usedColorsCount)) {
                    const count = usedColorsCount[code];
                    if (usedColorsCount[code] > currentCount) {
                        currentCount = usedColorsCount[code];
                        foundCode = code;
                    }
                }

                row.push(foundCode);
            }
            bPixelsWindow.push(row);
        }

        const checked = this.checkBPixels(bPixelsWindow, w, h);

        return bPixelsWindow;
    }

    private checkBPixels(data: Array<Array<string>>, w: number, h: number) {
        for (let y = 0; y < h; y++) {
            let rowStart = true;
            let currentCode = data[y][0];
            let len = 0;
            for (let x = 0; x < w; x++) {
                if (data[y][x] !== currentCode) {
                    if (len < 3 && !rowStart) {
                        data[y][x] = currentCode;
                    } else {
                        rowStart = false;
                        currentCode = data[y][x];
                        len = 1;
                        continue;
                    }
                }
                len++;
            }
        }
        return data;
    }

    private readPixel(image: ImageData, pointer: number): string {
        const colorTriplet = [image.data[pointer], image.data[pointer + 1], image.data[pointer + 2]] as SplitRgbColor;
        return this.findCode(colorTriplet);
    }

    private findCode(colorTriplet: SplitRgbColor): string {
        for (const code of Object.keys(this.splitPalette)) {
            const paletteColor = this.splitPalette[code];
            if (
                paletteColor[0] === colorTriplet[0] &&
                paletteColor[1] === colorTriplet[1] &&
                paletteColor[2] === colorTriplet[2]
            ) {
                return code.substring(1, 4);
            }
        }
        return '000';
    }
}
