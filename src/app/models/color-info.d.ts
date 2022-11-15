import { FixedSizeArray } from 'fixed-size-array';
export declare type SplitRgbColor = FixedSizeArray<3, number>;
export declare class ColorInfo {
    diff?: number;
    color?: SplitRgbColor;
    code?: string;
}
