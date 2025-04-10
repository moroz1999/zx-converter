import {Injectable} from '@angular/core';
import {SplitRgbColor} from './split-rgb-color';
import {SplitPalette} from './split-palette';

@Injectable({
    providedIn: 'root',
})
export class PaletteSplitterService {

    constructor() {
    }

    public splitPalette(palette: { [key: string]: number }): SplitPalette {
        const splitPalette = {} as SplitPalette;
        for (let [code, color] of Object.entries(palette)) {
            splitPalette[code] = this.splitRgb(color);
        }
        return splitPalette;
    }

    private splitRgb(rgb: number): SplitRgbColor {
        let r = (rgb >> 16) & 0xFF;
        let g = (rgb >> 8) & 0xFF;
        let b = rgb & 0xFF;

        return [r, g, b];
    };
}
