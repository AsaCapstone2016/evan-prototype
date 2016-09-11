var amazon = require('amazon-product-api');
var https = require('https');

var PAGE_TOKEN = "EAAPZBKNex1QgBAHkVScEXFwigi8bAUxVWSCT4w1IEHZC0QKZCkxs2eXSiSdFxNLtyZAlEruTMXWd52dVnOtZBORXy2FhkJHF2pNgE7nH7BrcJktgB7Jl1EWavF7eCbZCWMh1AgMbsSx1bVpnGmOISyzm2ZBlGnOHAmc4zMVyKz4TwZDZD";

var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
var options = {
    host: "graph.facebook.com",
    path: path,
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
};

exports.handle = function (event, context, callback) {

    console.log('event: ' + JSON.stringify(event));

    var messagingEvents = event['body-json'].entry[0].messaging;
    for (var i = 0; i < messagingEvents.length; i++) {
        var messagingEvent = messagingEvents[i];

        var sender = messagingEvent.sender.id;
        if (messagingEvent.message && messagingEvent.message.text) {
            var text = messagingEvent.message.text;

            sendTypingMessage(sender);

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
                console.log(JSON.stringify(results));
                sendTextMessage(sender, results);
            });

        }
    }

};

function sendTextMessage(senderFbId, resultsJson) {

    var elements = [];
    resultsJson.forEach(function (product) {
        console.log(product.ItemAttributes[0].Title[0]);
        var element = {};
        element.title = product.ItemAttributes[0].Title[0];
        element.item_url = product.DetailPageURL[0];
        element.image_url = product.LargeImage[0].URL[0];
        element.subtitle = product.OfferSummary[0].LowestNewPrice[0].FormattedPrice[0];
        element.buttons = [
            {
                "type": "web_url",
                "url": "https://cse.msu.edu",
                "title": "Add to Cart"
            }];

        elements.push(element);
    });

    console.log('Elements: ' + JSON.stringify(elements));

    var json = {
        recipient: {id: senderFbId},
        message: {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": elements
                }
            }
        }
    };
    var body = JSON.stringify(json);

    var req = https.request(options);

    req.write(body);
    req.end();
}

function sendTypingMessage(senderFbId) {
    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
    var options = {
        host: "graph.facebook.com",
        path: path,
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    };

    var typingRequest = https.request(options);

    var typingJson = {
        "recipient": {
            "id": senderFbId
        },
        "sender_action": "typing_on"
    };

    typingRequest.write(JSON.stringify(typingJson));
    typingRequest.end();
}