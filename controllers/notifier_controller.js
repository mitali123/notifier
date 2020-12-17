const models = require('../models');

var parse_messages = function(msg) {
    var message = msg.value;
    //var zip = msg.value.zipcode;
    let l = JSON.parse(message);
   console.log("message -----------------"+l);
   // console.log("message----------------------------------------"+l);
}
exports.parse_messages = parse_messages;