const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
var module_text = require("./module/text");
var module_voice = require("./module/voice");
var router = require("./router");
var voice_connection = false;
var dispatcher;
var is_play = false;
var is_end = true;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if(!msg.author.bot){
        // เช็ค prefix
        if(router.is_cmd(msg) == true){
            var cmd_type = router.command_type(msg)
            //ถ้ารู้จักคำสั่ง
            if(cmd_type != 'unknow'){
                if(cmd_type == 'respond_text'){
                    msg.channel.send(module_text.text(msg));
                }
                else if(cmd_type == 'respond_voice'){
                    console.log('voice cmd detect \n');
                    var parser = module_voice.exc(msg);
                    if (msg.member.voice.channel) {
                        if(parser[0] != 'exit'){
				voice_connection = await msg.member.voice.channel.join();
			}
                        if(parser[0] == 'play'){
			    is_play = true;
			    is_end = false;
                            dispatcher = voice_connection.play(ytdl(parser[1], 'highestaudio'));

                            dispatcher.on('finish', () => {
                            	console.log('Finished playing!');
				is_play = false;
				is_end = true;
			    	dispatcher.destroy(); // end the stream
                            });

                            

                        }
			else if(parser[0] == 'pause'){
				if(is_play == true){
					is_play = false;
					dispatcher.pause();
					msg.channel.send('Pause');
				}
			}
			else if(parser[0] == 'resume'){
				if(is_play == false && is_end == false){
					is_play = true;
					dispatcher.resume();
					msg.channel.send('Resume');
				}
				else{
					msg.channel.send("No pause");
				}
			}
			else if(parser[0] == 'stop'){
				if(is_play == true){
					dispatcher.destroy();
					msg.channel.send('Stop');
				}
			}
			else if(parser[0] == 'exit'){
				if(voice_connection != false && ('status' in voice_connection && voice_connection.status != 4)){
					voice_connection.disconnect()
					voice_connection = false;
					msg.channel.send('Bye');
				}
				else{
					msg.channel.send("I'm not connect to voice channel or service restart");
				}
			}
                    } else {
                        console.log('not detect voice join \n');
                        msg.reply('You need to join a voice channel first!');
                    }

                }
            }
            
        }
    }
});

//login
client.login('token');
client.on('debug', console.log)
