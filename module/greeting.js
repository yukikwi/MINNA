(function() {


    function greeting_fetch(connection, guild_id){
        return new Promise(function(resolve, reject) {
            connection.query('SELECT * FROM greeting WHERE greeting_guild = "'+guild_id+'" ', function(error, result, fields){
                if (error) {
                    return reject(error);
                }
                resolve(result)
            })
        });
    }

    async function hook_greeting(connection, member){
        var greeting_data = await greeting_fetch(connection, member.guild.id)
        if(greeting_data.length != 0){
            const channel = member.guild.channels.cache.find(ch => ch.name === greeting_data[0].greeting_room);
            // Do nothing if the channel wasn't found on this server
            if (!channel) return;
            // Send the message, mentioning the member
            var text = greeting_data[0].greeting_pattern.replace('@mention', '<@'+member.id+'>')
            channel.send(text);
        }
        
    }
    
    async function add_greeting(connection, msg, pattern, room){
        var greeting_data = await greeting_fetch(connection, msg.guild.id)
        if(greeting_data.length != 0){
            connection.query("DELETE FROM greeting WHERE greeting.greeting_guild = ?", [msg.guild.id], function(error, result, fields){
                add_greeting(connection, msg, pattern, room)
            })
        }
        else{
            connection.query("INSERT INTO `greeting` (`greeting_id`, `greeting_guild`, `greeting_pattern`, `greeting_room`) VALUES (NULL, ?, ?, ?); ",[msg.guild.id, pattern, room], function(error, result, fields){
                if (error) {
                    msg.reply("Error fail to add greeting")
                    console.log(error)
                }
                else{
                    msg.reply("Success to add greeting")
                }
            })
        }
    }

    async function remove_greeting(connection, msg){
        var greeting_data = await greeting_fetch(connection, msg.guild.id)
        if(greeting_data.length != 0){
            connection.query("DELETE FROM greeting WHERE greeting.greeting_guild = ?", [msg.guild.id], function(error, result, fields){
                if(!error){
                    msg.reply("Success to remove Greeting")
                }
                else{
                    msg.reply("Fail to remove Greeting")
                }
            })
        }
        else{
            msg.reply("Didn't found any greeting setting")
        }
    }

    function greeting(connection, msg){
        var command = msg.content.split(" ")[0];
        if(command == 'add_greeting'){
            var temp = msg.content.match(/\w+|"[^"]+"/g)
            var pattern = temp[1].slice(1,-1)
            var room = msg.channel.name
            return add_greeting(connection, msg, pattern, room)
        }
        if(command == 'remove_greeting'){
            console.log("Call remove")
            return remove_greeting(connection, msg);
        }
    }

    module.exports.hook_greeting = function(connection, member) {
        return hook_greeting(connection, member);
    }

    module.exports.greeting = function(connection, msg) {
        msg.content = msg.content.substring(1);
        return greeting(connection, msg);
    }

}())