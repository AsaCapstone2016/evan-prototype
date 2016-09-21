/**
 * Created by evan on 9/20/16.
 */
var facebookEventConverter = require('../modules/facebookEventConverter');
var expect = require('chai').expect;
//This is a basic FB event
var facebookEvent = {
        "object": "page",
        "entry": [
        {
                "id": "671648416325901",
                "time": 1474479140224,
                "messaging": [
                {
                        "sender": {
                                "id": "1114852861896648"
                        },
                        "recipient": {
                                "id": "671648416325901"
                        },
                        "timestamp": 1474479140179,
                        "message": {
                                "mid": "mid.1474479140172:fddaed0caa2f0e4589",
                                "seq": 7,
                                "text": "hey"
                        }
                }
                ]
        }
        ]
};

describe('Facebook Event Converter',function(){

        describe('convertEvent',function(){
                it('returns correct object for given facebook event',function(){
                    var event = facebookEventConverter.convertEvent(facebookEvent);
                    console.log(JSON.stringify(event)); 
                    console.log(JSON.stringify({UID: "1114852861896648",
                        message: {
                            payload: "hey",
                            action: "text"
                        }}));
                    expect(event).to.equal({
                        UID: "1114852861896648",
                        message: {
                            payload: "hey",
                            action: "text"
                        }
                    });
                });
        });

});
