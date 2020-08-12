(function() {

    var font_dir = './resources/fonts/';
    var img_dir = './resources/img/';

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

    const applyText = (canvas, text, font, fontSize = 70) => {
        const ctx = canvas.getContext('2d');
    
        do {
            // Assign the font to the context and decrement it so it can be measured again
            ctx.font = `${fontSize -= 10}px `+font;
            // Compare pixel width of the text to the canvas minus the approximate avatar size
        } while (ctx.measureText(text).width > canvas.width - 300);
    
        // Return the result to use in the actual canvas
        return ctx.font;
    };

    async function image_greeting(member, head, MessageAttachment, Canvas){
        //Font register
        Canvas.registerFont(font_dir+'Fc-Galaxy/FC Galaxy Regular.ttf', { family: 'Galaxy' })

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(img_dir+'wallpaper.jpg');
        
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        

        //Text design
        // Slightly smaller text placed above the member's display name
        ctx.font = applyText(canvas, head, 'Galaxy', 45);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(head, canvas.width / 2.75, canvas.height / 2.7);
        
        // Assign the decided font to the canvas
        ctx.font = applyText(canvas, member.displayName, 'Galaxy');
        ctx.fillStyle = '#ffffff';
        ctx.fillText(member.displayName, canvas.width / 2.5, canvas.height / 1.6);

        ctx.beginPath();
        //75 = radius
        ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
        
        ctx.closePath();
        
        ctx.clip();

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));

        ctx.drawImage(avatar, 50, 50, 150, 150);

        return new MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
    }
        

    async function hook_greeting(connection, member, MessageAttachment, Canvas){
        console.log("Hook: search "+member.guild.id)
        var greeting_data = await greeting_fetch(connection, member.guild.id)
        if(greeting_data.length != 0){
            console.log("Hook: Found Greeting setting")
            const channel = member.guild.channels.cache.find(ch => ch.name == greeting_data[0].greeting_room);
            // Do nothing if the channel wasn't found on this server
            if (!channel) {
                console.log("Hook: No Channel found")
            }
            else{
                console.log("Hook: Channel detect")// Send the message, mentioning the member
                var text = greeting_data[0].greeting_pattern.replace('@mention', '<@'+member.id+'>')
                if(text != ''){
                    channel.send(text);
                }

                if(greeting_data[0].greeting_img_head != ''){
                    var image = await image_greeting(member, greeting_data[0].greeting_img_head, MessageAttachment, Canvas);
                    channel.send(image)
                }
            }
            
        }
        else{
            console.log("Hook: No Greeting setting")
        }
        
    }

    async function add_greeting(connection, msg, pattern, room){
        var greeting_data = await greeting_fetch(connection, msg.guild.id)
        if(greeting_data.length != 0){
            connection.query("UPDATE `greeting` SET `greeting_pattern` = ?, `greeting_room` = ? WHERE `greeting`.`greeting_guild` = ?", [pattern, room, msg.guild.id], function(error, result, fields){
                if (error) {
                    msg.reply("Error fail to add greeting")
                    console.log(error)
                }
                else{
                    msg.reply("Success to add greeting")
                }
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

    async function add_img_greeting(connection, msg, greeting_img_head, room){
        var greeting_data = await greeting_fetch(connection, msg.guild.id)
        if(greeting_data.length != 0){
            connection.query("UPDATE `greeting` SET `greeting_img_head` = ?, `greeting_room` = ? WHERE `greeting`.`greeting_guild` = ?", [greeting_img_head, room, msg.guild.id], function(error, result, fields){
                if (error) {
                    msg.reply("Error fail to add greeting image")
                    console.log(error)
                }
                else{
                    msg.reply("Success to add greeting image")
                }
            })
        }
        else{
            connection.query("INSERT INTO `greeting` (`greeting_id`, `greeting_guild`, `greeting_img_head`, `greeting_room`) VALUES (NULL, ?, ?, ?); ",[msg.guild.id, greeting_img_head, room], function(error, result, fields){
                if (error) {
                    msg.reply("Error fail to add greeting image")
                    console.log(error)
                }
                else{
                    msg.reply("Success to add greeting image")
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
            var temp = msg.content.match(/[^" ]+|"[^"]+"/g)
            var pattern = temp[1].slice(1,-1)
            var room = msg.channel.name
            return add_greeting(connection, msg, pattern, room)
        }
        if(command == 'remove_greeting'){
            console.log("Call remove")
            return remove_greeting(connection, msg);
        }
        if(command == 'add_img_greeting'){
            var temp = msg.content.match(/[^" ]+|"[^"]+"/g)
            var greeting_img_head = temp[1]
            var room = msg.channel.name
            return add_img_greeting(connection, msg, greeting_img_head, room)
        }
    }

    module.exports.hook_greeting = function(connection, member, MessageAttachment, Canvas) {
        return hook_greeting(connection, member, MessageAttachment, Canvas);
    }

    module.exports.greeting = function(connection, msg, MessageAttachment, canvas) {
        msg.content = msg.content.substring(1);
        return greeting(connection, msg, MessageAttachment, canvas);
    }

}())