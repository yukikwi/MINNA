(function() {

    var text = function(client, msg){
        if (msg.content === 'ping') {
            var ping_value = Math.round(client.ws.ping) + ' ms'
            return ping_value;
        }
    }

    module.exports.text = function(client, msg) {
        msg.content = msg.content.substring(1);
        return text(client, msg);
    }

}());
