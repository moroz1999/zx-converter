"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaletteReducer = void 0;
const color_info_1 = require("../models/color-info");
class PaletteReducer {
    constructor() {
        this.zxPalette = {
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
        this.pairColors = {
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
        this.pixelsData = [];
        this.attributesData = [];
        this.splitPalette = {};
        for (let [code, color] of Object.entries(this.zxPalette)) {
            this.splitPalette[code] = PaletteReducer.splitRgb(color);
        }
    }
    reducePalette(imageData, resultImageData) {
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
    processAttribute(attrX, attrY) {
        var _a, _b, _c;
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
        let usedColorsIndex = {};
        for (let info of colors) {
            let closest = new color_info_1.ColorInfo();
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
            usedColors.push({ 'code': code, 'count': count });
        }
        usedColors.sort(function (a, b) {
            return b.count - a.count;
        });
        let minColor;
        let maxColor = ((_a = usedColors.shift()) === null || _a === void 0 ? void 0 : _a.code) || '0000';
        if (usedColors.length > 0) {
            minColor = ((_b = usedColors.shift()) === null || _b === void 0 ? void 0 : _b.code) || '0000';
            if (maxColor && this.pairColors[maxColor] == minColor) {
                if (usedColors.length > 0) {
                    minColor = ((_c = usedColors.shift()) === null || _c === void 0 ? void 0 : _c.code) || '0000';
                }
                else {
                    minColor = maxColor;
                }
            }
        }
        else {
            minColor = maxColor;
        }
        for (let i in colors) {
            let info = colors[i];
            if (PaletteReducer.colorDiff(info['color'], this.splitPalette[maxColor]) < PaletteReducer.colorDiff(info['color'], this.splitPalette[minColor])) {
                PaletteReducer.imageSetPixel(this.resultImageData, info['x'], info['y'], this.splitPalette[maxColor]);
                this.setChrdPixel(true, info['x'], info['y'], maxColor);
            }
            else {
                PaletteReducer.imageSetPixel(this.resultImageData, info['x'], info['y'], this.splitPalette[minColor]);
                this.setChrdPixel(false, info['x'], info['y'], minColor);
            }
        }
    }
    ;
    setChrdPixel(ink, x, y, colorCode) {
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
        }
        else {
            brightness = colorCode.substr(0, 1);
        }
        if (ink) {
            attribute = '0' + brightness + attribute.substr(2, 3) + colorCode.substr(1, 3);
        }
        else {
            attribute = '0' + brightness + colorCode.substr(1, 3) + attribute.substr(5, 3);
        }
        this.attributesData[attrY][attrX] = attribute;
    }
    static imageColorAt(imageData, x, y) {
        let canvasCoordinate = (y * imageData.width + x) * 4;
        return [
            imageData.data[canvasCoordinate], imageData.data[canvasCoordinate + 1],
            imageData.data[canvasCoordinate + 2],
        ];
    }
    ;
    static imageSetPixel(imageData, x, y, color) {
        let canvasCoordinate = (y * imageData.width + x) * 4;
        imageData.data[canvasCoordinate] = color[0];
        imageData.data[canvasCoordinate + 1] = color[1];
        imageData.data[canvasCoordinate + 2] = color[2];
        imageData.data[canvasCoordinate + 3] = 255;
    }
    ;
    static colorDiff(rgb, rgb2) {
        return PaletteReducer.simpleDiff(rgb[0], rgb[1], rgb[2], rgb2[0], rgb2[1], rgb2[2]);
    }
    ;
    static simpleDiff(R1, G1, B1, R2, G2, B2) {
        let rMean = (R1 + R2) / 2;
        let r = R1 - R2;
        let g = G1 - G2;
        let b = B1 - B2;
        let weightR = 2 + rMean / 256;
        let weightG = 4.0;
        let weightB = 2 + (255 - rMean) / 256;
        return Math.sqrt(weightR * r * r + weightG * g * g + weightB * b * b);
    }
    ;
    static splitRgb(rgb) {
        let r = (rgb >> 16) & 0xFF;
        let g = (rgb >> 8) & 0xFF;
        let b = rgb & 0xFF;
        return [r, g, b];
    }
    ;
}
exports.PaletteReducer = PaletteReducer;
//# sourceMappingURL=palette-reducer.js.map