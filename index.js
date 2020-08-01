const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const utf8 = require('utf8');
var module_text = require("./module/text");
var module_voice = require("./module/voice");
var router = require("./router");
var validUrl = require('valid-url');
var q = []
const YouTube = require("discord-youtube-api");
const youtube = new YouTube("token");
var voice_connection = false;
var dispatcher;
var is_play = false;
var is_end = true;
var is_connect = false;

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
                    msg.channel.send(module_text.text(client, msg));
                }
                else if(cmd_type == 'respond_voice'){
					//หมวดหมู่เสียง
                    console.log('voice cmd detect \n');
                    if (msg.member.voice.channel) {
                        var temp_res = await module_voice.music_exc(msg, voice_connection, dispatcher, is_play, is_end, is_connect, validUrl, youtube, utf8, ytdl, q)
                        is_play = temp_res[0];
                        is_end = temp_res[1];
                        voice_connection = temp_res[2];
                        is_connect = temp_res[3];
                        dispatcher = temp_res[4]
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
