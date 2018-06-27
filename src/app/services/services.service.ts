import { Injectable } from '@angular/core';
import {Subject, zip} from 'rxjs';
import {Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import disable = chrome.browserAction.disable;

@Injectable()
export class ServicesService {

    private settingsExtension = new Subject<any>();
    public settingsExtension$ = this.settingsExtension.asObservable();


    constructor(private http : HttpClient){}

    sendSettings(settings){
        this.settingsExtension.next(settings)
    }
    getAllLanguages(type){

    }
    setAllLanguages(){
        //Получить список поддерживаемых языков и добавить в хранилище
        zip([{url : 'https://translate.yandex.net/api/v1.5/tr.json/getLangs',
                key : 'trnsl.1.1.20180528T062613Z.b13634cd40f09b29.a3a7755840d6e4f814692370d6b67f798c38ee35',
                ui : window.navigator.language.substring(0, window.navigator.language.indexOf('-'))
            }/*,
            {url : '', key : '', ui : ''}*/
        ].map((mode, inx) => {
            return this.http.get(`${mode.url}?ui=${mode.ui}&key=${mode.key}`);
        })).subscribe(result => {
            debugger;
            /*
                        chrome.storage.sync.set({translatorAllLanguages: result})   ;
                        */
        })
    }
    getSettings(settings) : Promise<any>{
        return new Promise((res, rej)=>{
            chrome.storage.sync.get(settings, result => {
                  res(result);
            })
        })


    }
    setSettings(settings) : Promise<any>{
        return new Promise((res, rej)=>{
            chrome.storage.sync.set(settings, () =>{
                res();
            })
        })

    }
}
export let defaultSettings = {

    exitBlockSlider : true,
    autoSource : false,
    targetLanguage : ['Русский(RU)',  Validators.required],
    sourceLanguage : ['Английский(EN)'],
    translateMode : ['0'], //режим перевода (1- Словарь яндекс,  0 - Yandex)
    showMode : ['0'], //режим отображение (0 - окном или 1 - иконкой)
    translateEvent : ['0'], //событие-тригер перевода
} ;