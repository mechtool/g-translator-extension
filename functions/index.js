const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
/*var request = require('request');

// make the request
request('put your external url here', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		//here put what you want to do with the request
	}
});*/

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/:type', (request, response)=>{
	response.send({par : request.params, q : request.query});
/*	let url = 'https://translation.googleapis.com/language/translate/v2/';
	if(request.params.type === 'detect'){
		response.json();
	}*/
});
exports.gTranslator = functions.https.onRequest(app);
