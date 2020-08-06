(function() {
    const prefix = "/";

    var is_cmd = function(msg){
        if (msg.content.charAt(0) == prefix) {
            return true;
        }
        else{
            return false;
        }
    }

    var command_type = function(msg){
        var msg_cmd = msg.content.split(" ")[0]
        if(msg_cmd == prefix+'ping' || msg_cmd == prefix+'inviteinfo' || msg_cmd == prefix+'invite'){
            return 'respond_text';
        }

        if(msg_cmd == prefix+'kick' || msg_cmd == prefix+'ban'){
            return 'respond_management';
        }

        if(msg_cmd == prefix+'play' || msg_cmd == prefix+'queue'  || msg_cmd == prefix+'skip' || msg_cmd == prefix+'pause' || msg_cmd == prefix+'exit' || msg_cmd == prefix+'stop' || msg_cmd == prefix+'resume'){
            return 'respond_voice';
        }
    }

    module.exports.is_cmd = function(msg) {
        return is_cmd(msg);
    }
    module.exports.command_type = function(msg) {
        return command_type(msg);
    }

}());
