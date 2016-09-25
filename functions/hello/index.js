var amazon = require('amazon-product-api');
var https = require('https');
var Q = require('q');
var facebookEventConverter = require('facebook-event-converter');
var Wit = require('cse498capstonewit').Wit;
var witCommunicator = require('wit-communicator');

var PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
var options = {
    host: "graph.facebook.com",
    path: path,
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
};

exports.handle = function (event, context, callback) {


    console.log(JSON.stringify(facebookEventConverter.convertEvent(event)));
    var messagingEvents = event.entry[0].messaging;

    const client = new Wit({accessToken: process.env.WIT_TOKEN});

    for (var i = 0; i < messagingEvents.length; i++) {
        var messagingEvent = messagingEvents[i];

        var sender = messagingEvent.sender.id;

        if (messagingEvent.message && messagingEvent.message.text) {
            var text = messagingEvent.message.text;

            sendTypingMessage(sender);
            var sessionId = witCommunicator.findOrCreateSession();
            var text = event.message.text;
            var attachments = event.message.attachments;

            console.log("text: " + text);

            if (attachments) {
                // We received an attachment
                // Let's reply with an automatic message
                fbMessage(sender, 'Sorry I can only process text messages for now.')
                    .catch(console.error);
            } else if (text) {
                // We received a text message

                console.log("before runActions");

                witCommunicator.runActions(sessionId,text,sessions[sessionId].context);
                // Updating the user's current session state
                sessions[sessionId].context = context;
            }

            client.message(text, {}).then(function (response) {
                console.log('wit response ' + JSON.stringify(response));
                if (response.entities.intent[0].value != "search") {
                    sendTextMessage(sender, response.entities.search_query[0].value);
                }
                else{
                    var client = amazon.createClient({
                        awsId: process.env.AWS_ID,
                        awsSecret: process.env.AWS_SECRET,
                        awsTag: "evanm-20"
                    });

                    return client.itemSearch({
                        searchIndex: 'All',
                        keywords: response.entities.search_query[0].value,
                        responseGroup: 'ItemAttributes,Offers,Images'
                    }).then(function (results) {
                        sendGenericTemplateMessage(sender, results);
                    });
                }
            });

        }
    }

};


function sendGenericTemplateMessage(senderFbId, resultsJson) {

    var elements = [];

    resultsJson.forEach(function (product) {
        var element = {};
        element.title = product && product.ItemAttributes[0] && product.ItemAttributes[0].Title[0];
        element.item_url = product && product.DetailPageURL[0];
        element.image_url = product && product.LargeImage && product.LargeImage[0] && product.LargeImage[0].URL[0];
        element.subtitle = product && product.OfferSummary && product.OfferSummary[0] &&
            product.OfferSummary[0].LowestNewPrice && product.OfferSummary[0].LowestNewPrice[0].FormattedPrice[0];
        element.buttons = [
            {
                "type": "web_url",
                "url": "https://cse.msu.edu",
                "title": "Add to Cart"
            }];

        elements.push(element);
    });

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

    return callSendAPI(json);
}

function sendTextMessage(senderFbId, text) {
    var json = {
        recipient: {id: senderFbId},
        message: {
            "text": text
        }
    };

    return callSendAPI(json);
}

function sendTypingMessage(senderFbId) {

    var typingJson = {
        "recipient": {
            "id": senderFbId
        },
        "sender_action": "typing_on"
    };

    callSendAPI(typingJson);
}

function callSendAPI(messageData) {

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

    req.write(JSON.stringify(messageData));
    req.end();
}
