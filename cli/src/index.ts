#!/usr/bin/env node

import {PaletteReducer} from './common/palette-reducer';
import {ChrdGenerator} from './common/chrd-generator';

const figlet = require('figlet');
const {Command} = require('commander');
const {get} = require('@andreekeberg/imagedata');
const fs = require('fs');
console.log(figlet.textSync('CHRD'));

const program = new Command();

program
  .version('1.0.0')
  .description('CLI app for CHRD converter')
  .option('-s, --source <value>', 'Source PNG filename')
  .option('-d, --destination <value>', 'Destination CHR$ filename')
  .parse(process.argv);
const options = program.opts();
const source = options.source;
if (source) {
  const destination = options.destination ?? source.substr(0, source.lastIndexOf('.')) + '.ch$';
  get(source, (error: any, imageData: ImageData) => {
    if (error) {
      console.log(error);
    } else {
      const paletteReducer = new PaletteReducer();
      const resultImageData = {...imageData};
      paletteReducer.reducePalette(imageData, resultImageData);

      const chrdGenerator = new ChrdGenerator();
      let pixelsData = paletteReducer.pixelsData;
      let attributesData = paletteReducer.attributesData;
      const bytes = chrdGenerator.generate(imageData.width, imageData.height, pixelsData, attributesData);

      fs.appendFile(destination, Buffer.from(bytes), function (err: any) {
        if (err) {
          console.log(err);
        } else {
          console.log('Converted successfully');
        }
      });
    }
  });
} else {
  program.help();
}
