import {ScaMode} from './sca-mode';
import {ZxScreen} from '../../services/zx-screen/zx-screen';

export type ModeToTypeMap = {
    [ScaMode.MODE_0]: ZxScreen[],
};

export type ScaTypeForMode<M extends ScaMode> = ModeToTypeMap[M];