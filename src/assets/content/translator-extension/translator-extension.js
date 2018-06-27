//iframe
var translatorExtension = {
	languageModes : [
		{name : 'yandex', url : 'https://translate.yandex.net/api/v1.5/tr.json/', path : {detect : 'detect', translate : 'translate', getLangs : 'getLangs'}, key : '?key=trnsl.1.1.20180528T062613Z.b13634cd40f09b29.a3a7755840d6e4f814692370d6b67f798c38ee35'},
		{name : 'yandex-d', url : 'https://dictionary.yandex.net/api/v1/dicservice.json/', path : {detect : 'getLangs', translate : 'lookup'},key : '?key=dict.1.1.20180621T141607Z.9e798eec4e84b91b.2262e7601f287e367cea751024e5fea011996362'}
		]
}  ;
document.addEventListener('DOMContentLoaded', ()=>{
	
	let listeners = [
		{event : 'click', listener : showHideMessages},
		{event : 'click', listener : getDetails},
		{event : 'click', listener : prepTranslate},
		{event : 'click', listener : function(){sendMessage({type : 'closeTranslator'})}},
		{event : 'keydown', listener : sendViewMessage},
	];
	translatorExtension.placeholders = document.querySelectorAll('.sourceLanguageText, .sourceLanguage, .targetLanguageText, .targetLanguage');
	//получение настроек приложения
	chrome.storage.sync.get('translatorSettings', settings =>{
		translatorExtension.appSettings = settings;
	});
	//установка обработчика получения сообщения из content-script
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
		if(message.type === 'translate'){
			prepTranslate(message);
		}
	});
	//Установка обработчиков событий кнопок
	document.querySelectorAll('#ms-btn, #btn-go, #btn-to, #btn-cls, #sourceLanguage').forEach((element, inx) => {
		let list = listeners[inx];
		element.addEventListener(list.event, list.listener);
	});
	sendViewMessage() ;
}) ;

function startTranslate(data) { //число, указывающее на индекс в коллекции languageModes
	let url,
		settings = translatorExtension.appSettings.translatorSettings,
		sourceLanguage = data.sourceLanguage || translatorExtension.placeholders[1].textContent,
		sourceLanguageText = data.sourceLanguageText || translatorExtension.placeholders[0].textContent,
		targetLanguageText = translatorExtension.placeholders[2].textContent,
		mode = translatorExtension.languageModes[typeof data.modeInx === 'undefined' ?  settings.translateMode[0] : data.modeInx];
 //формирование яндекс строки или формирование строки яндекс-словаря
		url = mode.url + (data.detect ? mode.path.detect : mode.path.translate) + mode.key +`&text=${encodeURIComponent(sourceLanguage)}${data.detect ? '' : `&lang=${sourceLanguageText !== '#' ? sourceLanguageText.toLowerCase()+'-' : '' }${targetLanguageText.toLowerCase()}${mode.ui || ''}${mode.flags || ''}`}` ;

	return fetch(url).then(result => result.json()) ;
}

function prepTranslate(message) {
	
	let body = {},
		spinner = document.querySelector('.targetSpinner');
	translatorExtension.placeholders.forEach(elem => {
		if(elem.classList.contains('targetLanguage')) {
			elem.querySelector('.targetLanguagePlaceholder').innerHtml = ''; //удаление старой разметки
		}
		else elem.textContent = body[elem.className] =  message.body[elem.className];
	});
	//запрос принадлежности выделенного фрагмента к языку
	startTranslate({modeInx: 0, detect : true}).then(res => {
		if(!RegExp(body.targetLanguageText,'gi').test(res.lang)){  //переводить, если язык источника и цель НЕ совпадают
			spinner.classList.add('is-active');  //запуск спинера
			if(!(body.sourceLanguageText === '#' || RegExp(body.sourceLanguageText,'gi').test(res.lang))){  //язык источника перевода не совпадает с настройками расширения
				setAutoLanguage(); //установка автоопределения
				//не совпадает с настройками расширения, тогда предупредить пользователя
				//формирование сообщения на языке пользователя
				startTranslate({modeInx : 0, detect : false, sourceLanguageText : 'ru', sourceLanguage  : 'Автоматическое определение языка включено!'})
				.then(res => {  //отображение сообщения или обработка ошибки
					res.code === 200 ? setBadgeMessage(res.text[0]): processError(res) ;
				});
			}
			//запуск перевода
			startTranslate({detect : false, sourceLanguageText : res.lang}).then(res => {
				spinner.classList.remove('is-active');
				res.code === 200 ? processTranslate(res) : processError(res);
			})
		}
	});
}

function setAutoLanguage(){
	//изменение интерфейса отображения языка - источника
	//изменение настроек приложения
	translatorExtension.placeholders[0].textContent = '#';
	translatorExtension.appSettings.translatorSettings.autoSource = true;
	chrome.storage.sync.set({translatorSettings : translatorExtension.appSettings.translatorSettings});
}

function processError(res){ //обработка ошибок
	document.querySelector('.targetSpinner').classList.remove('is-active');
}

function processTranslate(res) {//обработка положительного результат
	let target = document.querySelector('.targetLanguagePlaceholder'),
		mode = translatorExtension.appSettings.translatorSettings.translateMode[0];
	if(mode === '0'){//yandex
		target.textContent = res.text;
	
	}
	else{ //yandex-dictionary
	   debugger;
	}
}

function setBadgeMessage(mess){ //устновка нового значения маркера сообщений

	let targets = document.querySelectorAll('.messageMarker,.messageSection'),
		el = targets[0],
		mesSect = targets[1],
		newMess = document.createElement('div') ;
	newMess.textContent = mess;
	newMess.className = 'extensionMessage';
	el.classList.add('is-active');
	el.textContent = (+el.textContent + 1).toString(10);
	mesSect.appendChild(newMess);
}

function showHideMessages() {//Показать/скрыть сообщения
	document.querySelectorAll('.messageMarker, .messageSection').forEach((el, inx)=>{
		if(inx === 0){
			el.textContent = '0';
			el.classList.remove('is-active');
		}
		else if(inx === 1) {
			el.classList.toggle('is-opened');
			//удаление элементов сообщений
			if(!el.classList.contains('is-opened')){
				document.querySelectorAll('.extensionMessage').forEach(el=>{
					el.parentElement.removeChild(el);
				})
			}
		}
	});
	sendViewMessage();
}

function getDetails() {//Боьше переведенных данных

}

function sendMessage(message) { //Отправка сообщения content script
	chrome.tabs.query({active: true}, function(tab) {
		chrome.tabs.sendMessage(tab[0].id , message, ()=>{});
		
	});
}

function sendViewMessage() {
	setTimeout(()=>{
		//отправка сообщкеия о размерах компонента в content script
		let rect = document.getElementById('extensionContainer');
		sendMessage({type : 'dimensions', body : {width : rect.offsetWidth, height : rect.offsetHeight}})  ;
	}, 10) ;
}


