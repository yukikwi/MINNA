(function() {

    var exc_manage = async function(client, msg){
        var command = msg.content.split(" ")[0];
        var mention_user = msg.mentions.users.first();

        if (command == 'kick') {
            if(msg.guild.member(msg.author).hasPermission('KICK_MEMBERS')){
                if(mention_user){
                    var member = msg.guild.member(mention_user)
                    if(member){
                        member.kick().then(()=>{
                            msg.reply("RIP <@"+member.id+">");
                        })
                        .catch(err => {
                            msg.reply("Can't kick member");
                            console.error(err);
                        });
                    }
                    else {
                        msg.reply("User not in server");
                    }
                }
                else {
                    msg.reply("Please mention user");
                }
            }
            else {
                msg.reply("Only admin can kick");
            }
        }
    }

    module.exports.manage = async function(client, msg) {
        msg.content = msg.content.substring(1);
        return exc_manage(client, msg);
    }

}());
