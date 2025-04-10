import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Sca} from './sca';
import {ParsedFrame} from './parsed-frame';
import {ScaMode} from './sca-mode';
import {ZxScreenService} from '../../services/zx-screen/zx-screen.service';
import {ScaTypeForMode} from './mode-to-type-map';
import {ZxScreen} from '../../services/zx-screen/zx-screen';
import {ZxScreenToBinaryService} from '../../services/zx-screen/zx-screen-to-binary.service';

const intDuration = 1000 / 50;

@Injectable({
    providedIn: 'root',
})
export class ScaGeneratorService {

    private header = 'sca';
    private version = 1;

    constructor(
        private zxScreenService: ZxScreenService,
        private zxScreenToBinaryService: ZxScreenToBinaryService,
    ) {
    }

    public generate<M extends ScaMode>(mode: M, parsedFrames: ParsedFrame[], width: number, height: number): Observable<Sca<ScaTypeForMode<M>>> {
        return new Observable(observer => {
            const frames = this.convertMode0Frames(parsedFrames);
            const durations = parsedFrames.map((frame: ParsedFrame) => {
                return frame.duration;
            });
            observer.next({
                width,
                height,
                mode,
                durations,
                frames,
            });
        });
    }

    public makeBinary<M extends ScaMode>(sca: Sca<ScaTypeForMode<M>>): Uint8Array | null {
        if (sca.mode === ScaMode.MODE_0) {
            const frames = sca.frames as unknown as ZxScreen[];
            const headerLength = 13;
            const tableLength = frames.length;
            const framesLength = frames.length * 6912;

            let bytes = new Uint8Array(headerLength + tableLength + framesLength);
            let pointer = 0;
            for (; pointer < this.header.length; pointer++) {
                bytes[pointer] = this.header.charCodeAt(pointer);
            }
            bytes[pointer] = this.version;
            pointer++;

            bytes[pointer] = sca.width & 0xFF;
            pointer++;
            bytes[pointer] = (sca.width >> 8) & 0xFF;
            pointer++;

            bytes[pointer] = sca.height & 0xFF;
            pointer++;
            bytes[pointer] = (sca.height >> 8) & 0xFF;
            pointer++;

            bytes[pointer] = frames.length & 0xFF;
            pointer++;
            bytes[pointer] = (frames.length >> 8) & 0xFF;
            pointer++;

            bytes[pointer] = sca.mode & 0xFF;
            pointer++;

            bytes[pointer] = headerLength & 0xFF;
            pointer++;
            bytes[pointer] = (headerLength >> 8) & 0xFF;
            pointer++;

            for (const duration of sca.durations) {
                bytes[pointer] = Math.round(duration / intDuration);
                pointer++;
            }

            for (const frame of frames) {
                const binary = this.zxScreenToBinaryService.convertToBinary(frame);
                bytes.set(binary, pointer);
                pointer += binary.length;
            }

            return bytes;
        }
        return null;
    }

    private convertMode0Frames(frames: ParsedFrame[]): ZxScreen[] {
        const screens = [];
        for (const frame of frames) {
            const zxScreen = this.zxScreenService.convertToScreen(frame.imageData);
            screens.push(zxScreen);
        }
        return screens;
    }
}