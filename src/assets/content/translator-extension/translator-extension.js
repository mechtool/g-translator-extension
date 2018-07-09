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
		{event : 'click', listener : prepTranslate},
		{event : 'click', listener : function(){sendMessage({type : 'closeTranslator'})}},
		{event : 'keydown', listener : sendViewMessage},
	],
		formNames = {
			ts : 'transcription',
			pos : 'part of speech',
			gen : 'gender',
			ex : 'examples',
			syn : 'synonyms',
			mean : 'meaning',
		};
	translatorExtension.placeholders = document.querySelectorAll('.sourceLanguageText, .sourceLanguage, .targetLanguageText, .targetLanguage');
	//получение настроек приложения
	chrome.storage.sync.get('translatorSettings', settings =>{
		translatorExtension.appSettings = settings;
	});
	//установка обработчика получения сообщения из content-script
	chrome.runtime.onMessage.addListener((message) =>{
		if(message.type === 'translate'){
			prepTranslate(message);
		}
	});
	//Установка обработчиков событий кнопок
	document.querySelectorAll('#ms-btn, #btn-go, #btn-cls, #sourceLanguage').forEach((element, inx) => {
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
		url = mode.url + (data.detect ? mode.path.detect : mode.path.translate) + mode.key +`&text=${encodeURIComponent(sourceLanguage)}${data.detect ? '' : `&lang=${['#', '*'].some((el)=> sourceLanguageText.indexOf(el) > 0)  ? '' : sourceLanguageText.toLowerCase()+'-' }${targetLanguageText.toLowerCase()}${mode.ui || ''}${mode.flags || ''}`}` ;

	return fetch(url).then(result => {
		return result.json().then((res)=>{
			return {data: res, status: result.status};
		})
	});
}

function prepTranslate(message) {
	
	let body = {},
		spinner = document.querySelector('.targetSpinner'),
		settings = translatorExtension.appSettings.translatorSettings,
		source = settings.sourceLanguage.toString(),
		target = settings.targetLanguage.toString();
	body.sourceLanguageText = settings.autoSource ? '#' : source.substr(source.indexOf('(') + 1, 2);
	body.targetLanguageText = target.substr(target.indexOf('(') + 1, 2);
	body.sourceLanguage = message.select || translatorExtension.placeholders[1].textContent; //элемент sourceLanguage
	//предварительная настройка интерфейса
	translatorExtension.placeholders.forEach(elem => {
		if(elem.classList.contains('targetLanguage')) {
			elem.querySelector('.targetLanguagePlaceholder').innerHTML = ''; //удаление старой разметки
		}
		else elem.textContent = body[elem.className];
	});
	//запрос принадлежности выделенного фрагмента к языку
	startTranslate({modeInx: 0, detect : true}).then(res => {
		if(!RegExp(body.targetLanguageText,'gi').test(res.data.lang)){  //переводить, если язык источника и цель НЕ совпадают
			spinner.classList.add('is-active');  //запуск спинера
			if(!(body.sourceLanguageText === '#' || RegExp(body.sourceLanguageText,'gi').test(res.data.lang))){  //язык источника перевода не совпадает с настройками расширения
				setAutoLanguage(); //установка автоопределения
				//не совпадает с настройками расширения, тогда предупредить пользователя
				//формирование сообщения на языке пользователя
				startTranslate({modeInx : 0, detect : false, sourceLanguageText : 'ru', sourceLanguage  : 'Автоматическое определение языка включено!'})
				.then(res => {  //отображение сообщения или обработка ошибки
					res.status === 200 ? setBadgeMessage(res.data.text[0]): processError(res.data) ;
				});
			}
			translatorExtension.appSettings.translatorSettings.autoSource && (translatorExtension.placeholders[0].textContent = res.data.lang.toUpperCase() +'*');
			//запуск перевода
			startTranslate({detect : false, sourceLanguageText : res.data.lang}).then(res => {
				spinner.classList.remove('is-active');
				res.status === 200 ? processTranslate(res.data) : processError(res.data);
			})
		}
		else{ //если совпадают ,тогда запустить изменение размеров фрейма на случай, если предыдущий запрос отображал данные
			// а текущий запрос их очистел и форма осталась пустой и большого размера
			sendViewMessage();
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
		let innerHTML = `<table>`;
		res.def.forEach(block => { //набор статей переводов
			innerHTML +=
`<tr><td><span class="tr-blue" >[  ${block.ts || ''} ] </span> <span class="tr-grey" >: ${block.pos || ''} ${block.gen || ''}</span></td></tr>
<tr><td><ul class="tr-list">`;
			for(let i = 0 ; i < block.tr.length; i++){
				//проверка ограничений на количество записей
				if(i >= 100) break;
				let tr = block.tr[i];
				innerHTML += `<li><span class="tr-blue">${tr.text ? tr.text : ''}${tr.gen ? '' : ','}</span> <span class="tr-grey">${tr.gen ? tr.gen +',' : ''}</span> `;
				if(true && tr.syn){ //если используються синонимы
					tr.syn.forEach(syn => {
						innerHTML += `<span class="tr-blue" >${syn.text ? syn.text: ''}${syn.gen ? '' : ','}</span> <span class="tr-grey">${syn.gen ? syn.gen+',' : ''}</span> `;
					})
				}
				innerHTML += `</li>`;
		   }
		   innerHTML += `</ul></td></tr>`;
	   });
		innerHTML += `</table>`;
		target.innerHTML = innerHTML;
	}
	sendViewMessage();
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

function sendMessage(message) { //Отправка сообщения content script
	chrome.tabs.getCurrent(current => {
		chrome.tabs.sendMessage(current.id , message, ()=>{});
	}) ;
/*	chrome.tabs.query({active: true}, function(tab) {
	
	});*/
}

function sendViewMessage() {
	setTimeout(()=>{
		//отправка сообщкеия о размерах компонента в content script
		let rect = document.getElementById('extensionContainer');
		sendMessage({type : 'dimensions', body : {width : rect.offsetWidth, height : rect.offsetHeight}})  ;
	}, 100) ;
}


