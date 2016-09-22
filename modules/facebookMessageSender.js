var Q = require('q');
var https = require('https');

var PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
var options = {
  host: "graph.facebook.com",
  path: path,
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
}

var facebookMessageSender = {



  //Input : {
  //          recipientId: ID of person to send message to.
  //          text: message of text
  //        }
  sendTextMessage: function(message){
    var json = {
      recipient: {id: message.recipientId},
      message: {
        "text": message.text
      }
    };

    return callSendAPI(json);
  }
}

function callSendAPI(messageData) {

  var deferred = Q.defer();

  var callback = function (response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {
      deferred.resolve(true);
    });
  };
  var req = https.request(options, callback);
  req.on('error', function (e) {
    console.log('problem with request: ' + e);
  });

  req.write(JSON.stringify(messageData));
  req.end();

  return Q.promise;
}

module.exports = facebookMessageSender;
