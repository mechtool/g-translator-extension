import { BrowserModule } from '@angular/platform-browser';
import {Inject, NgModule} from '@angular/core';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackgroundPageComponent } from './background-page/background-page.component';
import { PopupPageComponent } from './popup-page/popup-page.component';
import { OptionsPageComponent } from './options-page/options-page.component';
import { DomSanitizer } from '@angular/platform-browser';
//------services-----------------------
import { ServicesService } from './services/services.service';
//---------material----------------------------
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MatIconRegistry,
    MatCardModule,
    MatRadioModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule, MatFormFieldModule, MatAutocompleteModule, MatInputModule, MatSelectModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';

import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent,
    BackgroundPageComponent,
    PopupPageComponent,
    OptionsPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
      ReactiveFormsModule,
    BrowserAnimationsModule,
      //----------material------------------------
      MatCardModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule ,
      MatTabsModule,
      MatButtonModule,
      MatIconModule,
      MatTooltipModule,
      MatFormFieldModule,
      MatAutocompleteModule,
      MatSlideToggleModule,
  ],

  providers: [
      ServicesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
    constructor(@Inject(MatIconRegistry) private matIconRegistry: MatIconRegistry, @Inject(DomSanitizer)private domSanitizer: DomSanitizer
    ) {   //регистрация набора иконок svg
/*        this.matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/mdi.svg'));*/
        //регистрауия отдельной иконки svg
        this.matIconRegistry.addSvgIcon(
            `ready-icon`,
            domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/circle-edit-outline.svg')
        );
    }
}
