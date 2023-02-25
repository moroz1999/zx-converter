import {ChangeDetectorRef, Component} from '@angular/core';
import {ImageReaderService} from '../../services/image-reader.service';
import {ChrdGeneratorService} from '../../services/chrd-generator.service';
import {PaletteReducerService} from '../../services/palette-reducer.service';
import {DownloadGeneratorService} from '../../services/download-generator.service';
import {ImageToDataService} from '../../services/image-to-data.service';
import {Observable, tap} from 'rxjs';

@Component({
  selector: 'app-bsc-converter',
  templateUrl: './bsc-converter.component.html',
  styleUrls: ['./bsc-converter.component.scss']
})
export class BscConverterComponent {

}
