export declare class PaletteReducer {
    private readonly zxPalette;
    private readonly pairColors;
    private readonly splitPalette;
    private imageData?;
    private resultImageData?;
    pixelsData: Array<Array<number>>;
    attributesData: Array<Array<string>>;
    constructor();
    reducePalette(imageData: ImageData, resultImageData: ImageData): ImageData;
    private processAttribute;
    private setChrdPixel;
    private static imageColorAt;
    private static imageSetPixel;
    private static colorDiff;
    private static simpleDiff;
    private static splitRgb;
}
