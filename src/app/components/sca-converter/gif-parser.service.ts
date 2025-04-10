import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {decompressFrames, parseGIF} from 'gifuct-js';
import {ParsedFrame} from './parsed-frame';
import {ParsedFrames} from './parsed-frames';

@Injectable({
    providedIn: 'root',
})
export class GifParserService {
    public parse(imageElement: HTMLImageElement): Observable<ParsedFrames> {
        return from(fetch(imageElement.src).then(response => response.arrayBuffer())).pipe(
            map((arrayBuffer: ArrayBuffer) => {
                const gif = parseGIF(arrayBuffer);
                const frames = decompressFrames(gif, true);
                const parsedFrames: ParsedFrame[] = frames.map((frame: any) => {
                    const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
                    return {imageData, duration: frame.delay};
                });
                return {frames: parsedFrames, width: gif.lsd.width, height: gif.lsd.height} as ParsedFrames;
            }),
            catchError(err => {
                throw new Error('Failed to parse GIF: ' + err);
            }),
        );
    }
}
