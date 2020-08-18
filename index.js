const { Client, MessageAttachment } = require('discord.js');
const client = new Client();
const canvas = require('canvas')
const ytdl = require('ytdl-core');
//const ytdl = require('ytdl-core-discord')
const utf8 = require('utf8');
var module_text = require("./module/text");
var module_voice = require("./module/voice");
var module_log = require("./module/log");
var module_manage = require("./module/management");
var module_greeting = require("./module/greeting");
var router = require("./router");
var voice_connection = {};
var dispatcher = {};
var player_status
const YouTube = require("discord-youtube-api");
const youtube = new YouTube("token");
var mysql      = require('mysql');
var db_name = 'discord'
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : db_name
});

connection.connect();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('DB: Clean start')
  connection.query("TRUNCATE `"+db_name+"`.`server`;", function(err, result){
    if(err){
        module_log.log('DB[server]: Clean fail['+err+']', 'red')
    }  else{
        module_log.log('DB[server]: Clean success', 'green')
    }
    
  })
  connection.query("TRUNCATE `"+db_name+"`.`music_queue`;", function(err, result){
    if(err){
        module_log.log('DB[music_queue]: Clean fail['+err+']', 'red')
    }  else{
        module_log.log('DB[music_queue]: Clean success', 'green')
    }
    
  })
});

client.on('guildMemberAdd', async member => {
    module_log.log('HOOK: guildMemberAdd');
    module_greeting.hook_greeting(connection, member, MessageAttachment, canvas)
});

client.on('message', async msg => {
    if(!msg.author.bot){
        // เช็ค prefix
        if(router.is_cmd(msg) == true){
            var cmd_type = router.command_type(msg)
            //ถ้ารู้จักคำสั่ง
            if(cmd_type != 'unknow'){
                if(cmd_type == 'respond_text'){
                    module_log.log('CMD: Text');
                    var temp_text = await module_text.text(client, msg);
                    if(temp_text != false){
                        msg.channel.send(temp_text);
                    }
                }
                else if(cmd_type == 'respond_management'){
                    module_log.log('CMD: Manage');
                    module_manage.manage(client, msg);
                }
                else if(cmd_type == 'respond_greeting'){
                    module_log.log('CMD: Greeting');
                    module_greeting.greeting(connection, msg, MessageAttachment, canvas);
                }
                else if(cmd_type == 'respond_voice'){
					//หมวดหมู่เสียง
                    module_log.log('CMD: Voice');
                    if (msg.member.voice.channel) {
                        if(!voice_connection.hasOwnProperty(msg.member.voice.channel.id)){
                            voice_connection[msg.member.voice.channel.id] = false
                            dispatcher[msg.member.voice.channel.id] = false
                        }
                        connection.query('SELECT * FROM server WHERE server_voice_id = "'+msg.member.voice.channel.id+'" ', async function (error, results, fields) {
                            if (error) throw error;
                            if(results.length == 0){
                                player_status = "stop";
                                module_log.log("Local: "+player_status)
                                var temp_sql_array = [player_status]
                                var temp_sql_data = temp_sql_array.join()
                                connection.query('INSERT INTO `server` (`server_id`, `server_voice_id`, `server_voice_data`) VALUES ("", "'+msg.member.voice.channel.id+'", "'+temp_sql_data+'");', function (error, results, fields) {
                                    
                                });
                            }
                            else{
                                temp_sql_data = results[0].server_voice_data.split(",");
                                player_status = results[0].server_voice_data;
                                module_log.log("DB: "+player_status)
                            }
                                
                            var temp_res = await module_voice.music_exc(msg, voice_connection[msg.member.voice.channel.id], dispatcher[msg.member.voice.channel.id], youtube, utf8, ytdl, player_status, connection)
                            voice_connection[msg.member.voice.channel.id] = temp_res[0];
                            dispatcher[msg.member.voice.channel.id] = temp_res[1]
                            
                            module_log.log("Music_EXEC: "+temp_res[2]);
                            player_status = temp_res[2];
                            var temp_sql_array = [temp_res[2]]
                            var temp_sql_data = temp_sql_array.join()
                            connection.query('UPDATE server set server_voice_data = "'+temp_sql_data+'" WHERE server_voice_id = "'+msg.member.voice.channel.id+'" ', function (error, results, fields) {
                                
                            });
                        });
                        
                    } else {
                        module_log.log('not detect voice join ', 'red');
                        msg.reply('You need to join a voice channel first!');
                    }

                }
            }
            
        }
    }
});

//login
client.login('token');
//client.on('debug', console.log)
