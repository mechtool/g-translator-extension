chrome.runtime.onConnect.addListener(onConnectHandler);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const command = message['command'];
	console.log('Received runtime command: ' + command);
	const response = { message: 'Привет!' };
	sendResponse(response);
});

function onConnectHandler() {
	chrome.runtime.Port.onMessage.addListener(onConnectMessageHandler);
}
function onConnectMessageHandler(msg, port) {
	console.log('Received connection message: ' + msg);
	const response = 'Приветствую!';
	port.postMessage(response);
}
