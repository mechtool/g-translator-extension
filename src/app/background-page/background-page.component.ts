import {Component, Inject, OnInit} from '@angular/core';
import {defaultSettings, ServicesService} from '../services/services.service';

//Отчистка хранилища
//chrome.storage.sync.clear();
//Методы заполнения хранилища настроек и запросы
// поддерживаемым языкам выведены из компонента, поскольку событие onInstalled
//срабатывает до инициализации класса компонента
chrome.runtime.onInstalled.addListener(()=>{
    //При установке, записываем настройки по умолчанию в базу, если там нет настроек
    chrome.storage.sync.get('translatorSettings', settings =>{
        chrome.storage.sync.set({translatorSettings: defaultSettings}, function() {
            console.log('Настройки разрешения сохранены (первый запуск background)');
        });
        //Получить список поддерживаемых языков и добавить в хранилище
        Promise.all([
            {
                url : 'https://translate.yandex.net/api/v1.5/tr.json/getLangs',
                key : '?key=trnsl.1.1.20180528T062613Z.b13634cd40f09b29.a3a7755840d6e4f814692370d6b67f798c38ee35',
                ui : '&ui='+window.navigator.language.substring(0, window.navigator.language.indexOf('-'))
            }/*,
        {url : '', key : '', ui : ''}*/
        ].map((mode) => {
            return fetch(`${mode.url + mode.key + mode.ui}`).then(result => result.json());
        })).then(processResult).catch(err => {
            console.log(err);
        })
    })
}) ;

function processResult(result) {//обработка результата и сохранение его в хранилище

    let f = result.map((data, inx)=>{
        let d = [];
        if(inx){ //Google

        }else{//Yandex
            for(let key in data.langs){
                d.push({text : data.langs[key] + `(${key.toUpperCase()})`});
            }
        }
        return d;
    });
    chrome.storage.sync.set({translatorAllLanguages: f}, ()=>{
        console.log('Список языков сохранен (background).')
    });
}

@Component({
  selector: 'app-backdround-page',
  templateUrl: './background-page.component.html',
  styleUrls: ['./background-page.component.css']
})
export class BackgroundPageComponent implements OnInit{

    constructor(@Inject(ServicesService) public appService : ServicesService) {
        this.setListeners();
    }

    setListeners(){
        //Подписка на получения сообщений из скриптов расширения
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{

        })
  }

  ngOnInit(){
        this.appService.setAllLanguages();
  }


}
