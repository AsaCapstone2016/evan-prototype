/**
 * Created by evan on 9/20/16.
 */
var facebookEventConverter = {

    convertEvent: function (event) {
        return {
            UID: event.entry[0].messaging[0].sender.id,
            message: {
                payload: event.entry[0].messaging[0].message.text,
                action: "text"
            }
        }
    }

};

module.exports = facebookEventConverter;
