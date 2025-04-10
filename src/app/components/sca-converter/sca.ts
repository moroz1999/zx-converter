import {ScaMode} from './sca-mode';

export interface Sca<T> {
    width: number,
    height: number,
    mode: ScaMode,
    frames: T,
    durations: number[],
}