import {Component, Inject, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FormGroup, FormBuilder } from '@angular/forms';
import {defaultSettings, ServicesService} from '../services/services.service';


@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrls: ['./popup-page.component.css']
})
export class PopupPageComponent implements OnInit{

    public languageList : [{text : string}];
    public mainExtensionGroup : FormGroup = this.fb.group(defaultSettings) ;

    constructor(@Inject(DOCUMENT) private doc : Document,
                @Inject(FormBuilder) private fb : FormBuilder,
                private appService : ServicesService){};

    onClickPopup(){
        //chrome.storage.sync.clear();
        this.appService.setSettings({translatorSettings: this.mainExtensionGroup.value}).then(()=>{
            console.log('Настройки разрешения сохранены (popup)');
        }) ;
        this.doc.defaultView.close();

    }

    ngOnInit() {

        //Получение сохраненных настроек и списка поддерживаемых языков
        let settings,
            that = this;
        this.appService.getSettings(['translatorSettings', 'translatorAllLanguages']).then(result => {
            console.log(result);
            if( !chrome.runtime.lastError ) {
                //настройки получены
                console.log('Настройки разрешения получены (popup)');
                that.mainExtensionGroup = this.fb.group(result.translatorSettings) ; //настройки
                that.languageList = result.translatorAllLanguages[0]; // языки todo - установить индекс языка
            }
        })
/*        this.appService.getSettings(['translatorSettings', 'translatorAllLanguages']).then(result => {

        }) ;*/
    }
}
