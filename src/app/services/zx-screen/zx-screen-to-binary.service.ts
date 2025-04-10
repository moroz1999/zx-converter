import {ZxScreen} from './zx-screen';
import {Injectable} from '@angular/core';

const widthA = 32;
const heightA = 24;
const widthPx = widthA * 8;
const heightPx = heightA * 8;

@Injectable({providedIn: 'root'})
export class ZxScreenToBinaryService {
    public convertToBinary(image: ZxScreen): Uint8Array {
        const bytes = new Uint8Array(6912);

        image.pixels.forEach((row, index) => {
            let rowAddress = this.getRowOffset(index);
            for (let pointer = 0; pointer < widthPx; pointer = pointer + 8) {
                const byte =
                    (row[pointer + 0] << 7) +
                    (row[pointer + 1] << 6) +
                    (row[pointer + 2] << 5) +
                    (row[pointer + 3] << 4) +
                    (row[pointer + 4] << 3) +
                    (row[pointer + 5] << 2) +
                    (row[pointer + 6] << 1) +
                    (row[pointer + 7] << 0);
                bytes[rowAddress] = byte;
                rowAddress++;
            }


        });
        let attributesPointer = widthA * heightA * 8;
        image.attributes.forEach((row, index) => {
            row.forEach((attribute) => {
                bytes[attributesPointer] = parseInt(attribute, 2);
                attributesPointer++;
            });
        });

        return bytes;
    }

    public getRowOffset(screenY: number): number {
        const blockIndex = Math.floor(screenY / 64);
        const blockBaseOffset = blockIndex * 64;
        const offsetInBlock = screenY - blockBaseOffset;
        const characterRow = Math.floor(offsetInBlock / 8);
        const pixelRow = offsetInBlock % 8;

        const rowWidth = 32;

        return (blockBaseOffset + pixelRow * 8 + characterRow) * rowWidth;
    }
}