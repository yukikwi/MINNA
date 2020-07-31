(function() {

    var exc = function(msg){
        var split_msg = msg.content.split(" ");
        return [split_msg[0] , split_msg[1]];
    }

    module.exports.exc = function(msg) {
        msg.content = msg.content.substring(1);
        return exc(msg);
    }

}());
