var amazon = require('amazon-product-api');
var facebookEventConverter = require('facebook-event-converter');
var facebookMessageSender = require('facebook-message-sender');
var witCommunicator = require('wit-communicator');

var Wit = require('cse498capstonewit').Wit;

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

            facebookMessageSender.sendTypingMessage(sender); // Let the user know we are thinking!

            //var sessionId = witCommunicator.findOrCreateSession();
            var text = messagingEvent.message.text;
            var attachments = messagingEvent.message.attachments;

            client.message(text, {}).then(function (response) {
                console.log('wit response ' + JSON.stringify(response));
                if (response.entities.intent[0].value != "search") {
                    return facebookMessageSender.sendTextMessage({
                        recipient_id: sender,
                        text: response.entities.search_query[0].value
                    });
                }
                else {
                    var aws = amazon.createClient({
                        awsId: process.env.AWS_ID,
                        awsSecret: process.env.AWS_SECRET,
                        awsTag: "evanm-20"
                    });

                    aws.itemSearch({
                        searchIndex: 'All',
                        keywords: response.entities.search_query[0].value,
                        responseGroup: 'ItemAttributes,Offers,Images'
                    }).then(function (results) {
                        facebookMessageSender.sendGenericTemplateMessage(sender, results);
                    });
                }
            });

        }
    }

};
