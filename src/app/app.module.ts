import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {ChrdConverterComponent} from './components/chrd-converter/chrd-converter.component';
import {MatTabsModule} from '@angular/material/tabs';
import { ImageLoaderComponent } from './components/image-loader/image-loader.component';
import { CanvasPreviewComponent } from './components/canvas-preview/canvas-preview.component';
import { BscConverterComponent } from './components/bsc-converter/bsc-converter.component';

@NgModule({
  declarations: [
    AppComponent,
    ChrdConverterComponent,
    ImageLoaderComponent,
    CanvasPreviewComponent,
    BscConverterComponent,
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
