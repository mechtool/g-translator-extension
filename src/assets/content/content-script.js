var translatorExtension ={};
//Получение настроек из хранилища
getSettings().then(sett => {
	//получили настройки
	translatorExtension.settings = sett;
	//Загузка фрейма компонента
	let iframe = translatorExtension.iframe = document.createElement('iframe');
	iframe.id = 'translator-extension-iframe';
	iframe.hidden = true;
	iframe.src = chrome.runtime.getURL('assets/content/translator-extension/translator-extension.html')  ;
	//добавление в документ
	document.body.appendChild(iframe);
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if(message.type === 'dimensions'){
			iframe.style.width = message.body.width+'px';
			iframe.style.height = message.body.height+'px';
		}
		else if(message.type === 'closeTranslator'){
			translatorExtension.iframe.hidden = true;
		}
	}) ;
	//Подписка на события запуска перевода (тригеры переводы)
	document.addEventListener(['dblclick', 'mouseup', 'dblclick'][translatorExtension.settings.translateEvent], actionTrigger);
}).catch(()=> console.log('Неудалось получить настройки.'));


function actionTrigger(event) {
	getSettings().then(sett => {
		//получили настройки
		translatorExtension.settings = sett;
		translatorExtension.select = document.getSelection().toString().trim();
		//если не нажата кнопка ctrl, выходим
		if((translatorExtension.settings.translateEvent === '2' && !event.ctrlKey) || !translatorExtension.select) return false;
		//Настройка и подготовка к отображению формы переводчика
		if(translatorExtension.settings.showMode[0] === '1') showTranslatorIcon(event);//отобразить иконку
		else showTranslatorForm(event); //отобразить форму
	});
}

function showTranslatorIcon(event) {
	let img = document.querySelector('.translatorExtensionIcon');
	if(!img){
		img = document.createElement('img');
		img.src = chrome.runtime.getURL('assets/imgs/translator.png');
		img.className = 'translatorExtensionIcon';
		img.addEventListener('click', (ev)=>{
			img.hidden = true; //скрытие
			showTranslatorForm(ev);
		}) ;
		document.body.appendChild(img);
		
	}
	img.style.left = window.scrollX + event.clientX +'px';
	img.style.top = window.scrollY + event.clientY + 'px';
	img.hidden = false; //отображение
}

function showTranslatorForm(event) {

	translatorExtension.iframe.style.left = window.scrollX + event.clientX +'px';
	translatorExtension.iframe.style.top = window.scrollY + event.clientY + 'px';
	translatorExtension.iframe.hidden = false; //отображение
	//запрос во фрем за переводом
	chrome.runtime.sendMessage({type : 'translate', select : translatorExtension.select})
}

function getSettings(){
	return new Promise((res, rej)=>{
		chrome.storage.sync.get('translatorSettings', (settings)=> {
			if (settings.translatorSettings) {
				console.log('Настройки разрешения получены из хранилища!');
				res(settings.translatorSettings);
			}
			else rej();
		});
	})
}


