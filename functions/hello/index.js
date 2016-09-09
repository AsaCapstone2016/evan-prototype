var amazon = require('amazon-product-api');
var https = require('https');

var PAGE_TOKEN = "EAAPZBKNex1QgBAHkVScEXFwigi8bAUxVWSCT4w1IEHZC0QKZCkxs2eXSiSdFxNLtyZAlEruTMXWd52dVnOtZBORXy2FhkJHF2pNgE7nH7BrcJktgB7Jl1EWavF7eCbZCWMh1AgMbsSx1bVpnGmOISyzm2ZBlGnOHAmc4zMVyKz4TwZDZD";

exports.handle = function (event, context, callback) {

    console.log('event: ' + JSON.stringify(event));

    var messagingEvents = event['body-json'].entry[0].messaging;
    for (var i = 0; i < messagingEvents.length; i++) {
        var messagingEvent = messagingEvents[i];

        var sender = messagingEvent.sender.id;
        if (messagingEvent.message && messagingEvent.message.text) {
            var text = messagingEvent.message.text;

            var client = amazon.createClient({
                awsId: "AKIAI3U2MXJFJIRKWGTQ",
                awsSecret: "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",
                awsTag: "evanm-20"
            });

            client.itemSearch({
                searchIndex: 'All',
                keywords: text,
                responseGroup: 'ItemAttributes,Offers,Images'
            }).then(function (results) {
                console.log(JSON.stringify(results[0].DetailPageURL));
                console.log('sender' + sender);
                sendTextMessage(sender, results[0].DetailPageURL[0]);
                callback(null, null);
            }).catch(function (err) {
                console.log(JSON.stringify(err));
            });


        }
    }

};

function sendTextMessage(senderFbId, text) {
    var json = {
        recipient: {id: senderFbId},
        message: {text: text}
    };
    var body = JSON.stringify(json);
    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
    var options = {
        host: "graph.facebook.com",
        path: path,
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    };
    var callback = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {

        });
    };
    var req = https.request(options, callback);
    req.on('error', function (e) {
        console.log('problem with request: ' + e);
    });

    req.write(body);
    req.end();
}