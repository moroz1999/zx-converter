import {FixedSizeArray} from 'fixed-size-array';

export type SplitRgbColor = FixedSizeArray<3, number>;

export class ColorInfo {
  diff?: number;
  color?: SplitRgbColor;
  code?: string;
}
