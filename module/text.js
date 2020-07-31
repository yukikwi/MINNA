(function() {

    var text = function(msg){
        if (msg.content === 'ping') {
            return 'pong';
        }
    }

    module.exports.text = function(msg) {
        msg.content = msg.content.substring(1);
        return text(msg);
    }

}());
