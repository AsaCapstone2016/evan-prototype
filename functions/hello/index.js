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

    var messageObjects = facebookEventConverter.convertEvent(event);
    messageObjects.forEach(function (messageObject) {
        var sender = messageObject.UID;
        if (messageObject.message.action == 'text') {
            facebookMessageSender.sendTypingMessage(sender); // Let the user know we are thinking!

            //var sessionId = witCommunicator.findOrCreateSession();
            var text = messageObject.message.payload;

            var session = witCommunicator.findOrCreateSession(sender);
            witCommunicator.runActions(session, text).then(function(){
                console.log('after runActions');
            });
            //client.message(text, {}).then(function (response) {
            //    console.log('wit response ' + JSON.stringify(response));
            //    if (response.entities.intent[0].value != "search") {
            //        return facebookMessageSender.sendTextMessage({
            //            recipient_id: sender,
            //            text: response.entities.search_query[0].value
            //        });
            //    }
            //    else {
            //        var aws = amazon.createClient({
            //            awsId: process.env.AWS_ID,
            //            awsSecret: process.env.AWS_SECRET,
            //            awsTag: "evanm-20"
            //        });
            //
            //        aws.itemSearch({
            //            searchIndex: 'All',
            //            keywords: response.entities.search_query[0].value,
            //            responseGroup: 'ItemAttributes,Offers,Images'
            //        }).then(function (results) {
            //            facebookMessageSender.sendGenericTemplateMessage(sender, results);
            //        });
            //    }
            //});
        }
    });

};
