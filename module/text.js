(function() {

    var exc_text = async function(client, msg){
        var command = msg.content.split(" ")[0];
        var args =  msg.content.split(" ")

        if (command === 'ping') {
            var ping_value = Math.round(client.ws.ping) + ' ms'
            return ping_value;
        }

        if (command == 'inviteinfo'){
    
            user = msg.mentions.users.first() || msg.author
        
            var returnmsg = msg.guild.fetchInvites().then(invites=> {
                const userInvites = invites.array().filter(o => o.inviter.id === user.id);
                var userInviteCount = 0;
                for(var i=0; i < userInvites.length; i++)
                {
                    var invite = userInvites[i];
                    userInviteCount += invite['uses'];
                }

                return '<@'+user.id +'> have invited '+userInviteCount+' user(s) to this server. Keep up the good work!';
            })
            return returnmsg;
        }

        if(command == 'invite'){
            if(args.length == 1){
                var max_use = 1
            }
            else if(args.length == 2){
                var max_use = args[1]
            }
            
            let invite = await msg.channel.createInvite(
                {
                maxUses : max_use,
                unique: true
                }
            )
            msg.reply(invite ? `Here's your invite: ${invite}, max user that can use this invitation is ${max_use}` : "There has been an error during the creation of the invite.");
            return false;
        }
    }

    module.exports.text = async function(client, msg) {
        msg.content = msg.content.substring(1);
        return exc_text(client, msg);
    }

}());
