var translatorExtension ={ body : {}, url : ''};
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
		translatorExtension.settings = sett;
		let body = translatorExtension.body,
			select = document.getSelection().toString().trim(),
			ctrl = translatorExtension.settings.translateEvent === '2',
			source = translatorExtension.settings.sourceLanguage.toString(),
			target = translatorExtension.settings.targetLanguage.toString();
		if((ctrl && !event.ctrlKey) || !select) return false;
		//Настройка и подготовка к отображению формы переводчика
		body.sourceLanguageText = translatorExtension.settings.autoSource ? '#' : source.substr(source.indexOf('(') + 1, 2);
		body.targetLanguageText = target.substr(target.indexOf('(') + 1, 2);
		body.sourceLanguage = select;
		translatorExtension.iframe.style.left = window.scrollX + event.clientX +'px';
		translatorExtension.iframe.style.top = window.scrollY + event.clientY + 'px';
		translatorExtension.iframe.hidden = false; //отображение
		//запрос во фрем за переводом
		chrome.runtime.sendMessage({type : 'translate', body : body})
	});
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


