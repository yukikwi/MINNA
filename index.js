const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const utf8 = require('utf8');
var module_text = require("./module/text");
var module_voice = require("./module/voice");
var router = require("./router");
var validUrl = require('valid-url');
var q = {}
const YouTube = require("discord-youtube-api");
const youtube = new YouTube("token");
var voice_connection = {};
var dispatcher = {};
var is_play = {};
var is_end = {};
var is_connect = {};
var player_status = {}

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
                    var temp_text = await module_text.text(client, msg);
                    if(temp_text != false){
                        msg.channel.send(temp_text);
                    }
                }
                else if(cmd_type == 'respond_voice'){
					//หมวดหมู่เสียง
                    console.log('voice cmd detect \n');
                    if (msg.member.voice.channel) {
                        if(!is_play.hasOwnProperty(msg.member.voice.channel.id)){
                            is_play[msg.member.voice.channel.id] = false;
                            is_end[msg.member.voice.channel.id] = true;
                            voice_connection[msg.member.voice.channel.id] = false;
                            is_connect[msg.member.voice.channel.id] = false;
                            dispatcher[msg.member.voice.channel.id] = false
                            q[msg.member.voice.channel.id] = []
                            player_status[msg.member.voice.channel.id] = false;
                        }

                        var temp_res = await module_voice.music_exc(msg, voice_connection[msg.member.voice.channel.id], dispatcher[msg.member.voice.channel.id], is_play[msg.member.voice.channel.id], is_end[msg.member.voice.channel.id], is_connect[msg.member.voice.channel.id], validUrl, youtube, utf8, ytdl, q[msg.member.voice.channel.id], player_status[msg.member.voice.channel.id])
                        
                        is_play[msg.member.voice.channel.id] = temp_res[0];
                        is_end[msg.member.voice.channel.id] = temp_res[1];
                        voice_connection[msg.member.voice.channel.id] = temp_res[2];
                        is_connect[msg.member.voice.channel.id] = temp_res[3];
                        dispatcher[msg.member.voice.channel.id] = temp_res[4]
                        q[msg.member.voice.channel.id] = temp_res[5]
                        player_status[msg.member.voice.channel.id] = false;
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
