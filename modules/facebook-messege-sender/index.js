var https = require('https');
var fetch = require('node-fetch');

var PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
var options = {
    host: "graph.facebook.com",
    path: path,
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
};

var facebookMessageSender = {

    //Input : {
    //          recipientId: ID of person to send message to.
    //          text: message of text
    //        }
    sendTextMessage: function (message) {
        var json = {
            recipient: {id: message.recipientId},
            message: {
                "text": message.text
            }
        };
        return callSendAPI(json);
    }
};

function callSendAPI(messageData) {

    return fetch('https://graph.facebook.com/me/messages?' + qs, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: messageData
    })
        .then(function (rsp) {
            rsp.json()
        })
        .then(function (json) {
            if (json.error && json.error.message) {
                throw new Error(json.error.message);
            }
            return json;
        });
}

module.exports = facebookMessageSender;
