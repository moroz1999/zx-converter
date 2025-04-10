import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ChrdGeneratorService {
    private colorType = 9;
    private header = 'chr$';

    generate(width: number, height: number, pixels: Array<Array<number>>, attributes: Array<Array<string>>): Uint8Array {
        let headerLength = 4 + 2 + 1;
        let charLength = 8 + 1;
        let charWidth = width / 8;
        let charHeight = height / 8;
        let bytes = new Uint8Array(headerLength + charWidth * charHeight * charLength);
        let pointer = 0;
        for (; pointer < this.header.length; pointer++) {
            bytes[pointer] = this.header.charCodeAt(pointer);
        }
        bytes[pointer] = charWidth;
        pointer++;
        bytes[pointer] = charHeight;
        pointer++;

        bytes[pointer] = this.colorType;
        pointer++;

        for (let charY = 0; charY < charHeight; charY++) {
            for (let charX = 0; charX < charWidth; charX++) {
                for (let rowsCounter = 0; rowsCounter < 8; rowsCounter++) {
                    let byteText = '';
                    for (let bitsCounter = 0; bitsCounter < 8; bitsCounter++) {
                        byteText += pixels[charY * 8 + rowsCounter][charX * 8 + bitsCounter];
                    }
                    bytes[pointer] = parseInt(byteText, 2);
                    pointer++;
                }
                bytes[pointer] = parseInt(attributes[charY][charX], 2);
                pointer++;
            }
        }
        return bytes;
    }
}
