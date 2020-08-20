var validUrl = require('valid-url');
const ytlist = require('youtube-playlist');

(function() {

    var temp_dispatcher 

    var exc = function(msg){
        var split_msg = msg.content.split(/ (.+)/);
        return [split_msg[0] , split_msg[1]];
    }

    function url_get(msg, voice, ytdl, connection){
        return new Promise(function(resolve, reject) {
            connection.query('SELECT queue_id, queue_url FROM music_queue WHERE queue_server = "'+msg.member.voice.channel.id+'" ORDER BY queue_id LIMIT 1', function(error, result, fields){
                if (error) {
                    return reject(error);
                }
                resolve(result[0])
            })
        });
    }

    function playlist_queue(connection, url, msg){
        return new Promise(function(resolve, reject) {
            ytlist(url, 'url').then(res => {
                if(res.data.playlist.length != 0){
                    var j = 0
                    for(var i = 0; i < res.data.playlist.length; i++){
                        connection.query('INSERT INTO `music_queue` (`queue_id`, `queue_url`, `queue_server`) VALUES (NULL, "'+res.data.playlist[i]+'", "'+msg.member.voice.channel.id+'"); ', function (error, results, fields) {
                            if(error){
                                console.log("Insert fail: "+error)
                                return false
                            }
                            else{
                                console.log("Insert: "+res.data.playlist[j])  
                                return true
                                j++;
                            }
                            
                        })
                    }
                    resolve(true)
                }
            })
        });
    }

    function db_queue(msg, connection){
        return new Promise(function(resolve, reject) {
            connection.query('SELECT queue_url FROM music_queue WHERE queue_server = "'+msg.member.voice.channel.id+'" ORDER BY queue_id', function(error, result, fields){
                if (error) {
                    return reject(error);
                }
                resolve(result)
            })
        });
    }

    function remove_first(msg, connection){
        new Promise(function(resolve, reject) {
            connection.query('DELETE FROM `music_queue` WHERE `music_queue`.`queue_server` = '+msg.member.voice.channel.id+' ORDER BY queue_id LIMIT 1', function(error, result, fields){
                if (error) {
                    return reject(error);
                }
            })
        });
    }

    function remove_all(msg, connection){
        new Promise(function(resolve, reject) {
            connection.query('DELETE FROM `music_queue` WHERE `music_queue`.`queue_server` = '+msg.member.voice.channel.id+'', function(error, result, fields){
                if (error) {
                    return reject(error);
                }
            })
        });
    }

    var player = async function(msg, voice, ytdl, connection, player_status){
        var data = await url_get(msg, voice, ytdl, connection)
        var url = data.queue_url
        var id = data.queue_id
        console.log('Playing: '+url);
        var player_status = "play"
        var temp_sql_array = [player_status]
        temp_sql_data = temp_sql_array.join()
        connection.query('UPDATE server set server_voice_data = "'+temp_sql_data+'" WHERE server_voice_id = "'+msg.member.voice.channel.id+'" ', function (error, results, fields) {
                                
        });
        var voice_bitrate = voice.channel.bitrate / 1000
        if(voice_bitrate <= 96){
            var quality = 18
        }
        else{
            var quality = 140
        }
        console.log('Voice: quality itag = '+quality)
        var youtube_media = await ytdl(url, { quality : quality,filter: format => 'audioonly' })
        youtube_media.on('info', (data)=>{
            msg.channel.send(":musical_note: Song title : "+data.videoDetails.title)
        })
        dispatcher = voice.play(youtube_media);
        //YTDL-core-discord style
        //dispatcher = voice.play(await ytdl(url), { type: 'opus', volume: false })
        
        dispatcher.on('finish', async function(){
            console.log('End playing!');
            dispatcher = null // end the stream
            await remove_first(msg, connection);
            queue = await db_queue(msg, connection);
            if(queue.length != 0){
                player(msg, voice, ytdl, connection, player_status)
            }
            else{
                voice.disconnect()
                player_status = "stop";
                var temp_sql_array = [player_status]
                var temp_sql_data = temp_sql_array.join()
                connection.query('UPDATE server set server_voice_data = "'+temp_sql_data+'" WHERE server_voice_id = "'+msg.member.voice.channel.id+'" ', function (error, results, fields) {
                                        
                });
                is_connect = "false"
            }
        });		
        
        return [dispatcher, player_status];
    }

    var music_exc = async function(msg, parser, voice_connection, dispatcher, youtube, utf8, ytdl, player_status, connection){
        console.log("CMD: "+parser[0])
        if(parser[0] != 'exit' && player_status == "stop"){
            console.log('voice connection...')
            voice_connection = await msg.member.voice.channel.join();
            player_status = "stop";
            connection.query('UPDATE server set server_voice_data = "stop" WHERE server_voice_id = "'+msg.member.voice.channel.id+'" ', function (error, results, fields) {
                console.log("Update: "+player_status)                 
            });
        }
            
        
        if(parser[0] == 'play'){
            parser[1] = utf8.encode(parser[1])
            if(validUrl.isUri(parser[1])){
                new Promise(function(resolve, reject) {
                    connection.query('INSERT INTO `music_queue` (`queue_id`, `queue_url`, `queue_server`) VALUES (NULL, "'+parser[1]+'", "'+msg.member.voice.channel.id+'"); ', function (error, results, fields) {
                        if(error){
                            console.log("Insert fail: "+error)
                        }
                        else{
                            console.log("Insert: "+parser[1])  
                        }
                    })
                })
            }
            else{
                var search = await youtube.searchVideos(parser[1]);
                new Promise(function(resolve, reject) {
                    connection.query('INSERT INTO `music_queue` (`queue_id`, `queue_url`, `queue_server`) VALUES (NULL, "https://www.youtube.com/watch?v='+search.id+'", "'+msg.member.voice.channel.id+'"); ', function (error, results, fields) {
                        console.log("Insert: https://www.youtube.com/watch?v="+search.id)  
                    })
                })
            }
            
            if(player_status == "stop"){
                var temp_player = await player(msg, voice_connection, ytdl, connection, player_status)
                
                dispatcher = temp_player[0]
                player_status = temp_player[1]
            }

        }
        else if(parser[0] == 'plist'){
            parser[1] = utf8.encode(parser[1])
            if(/^.*(youtu.be\/|list=)([^#\&\?]*).*/.test(parser[1])){
                var url = 'https://www.youtube.com/playlist?list='+parser[1].match(/list=([^&#]{5,})/)[1]
                await playlist_queue(connection, url, msg)
                if(player_status == "stop"){
                    console.log("Song start")
                    var temp_player = await player(msg, voice_connection, ytdl, connection, player_status)
                    
                    dispatcher = temp_player[0]
                    player_status = temp_player[1]
                }
            }
            
        }
        else if(parser[0] == 'pause'){
            console.log(dispatcher.paused)
            if(dispatcher != null && dispatcher.paused == false){
                player_status = "pause"
                connection.query('UPDATE server set server_voice_data = "pause" WHERE server_voice_id = "'+msg.member.voice.channel.id+'" ', function (error, results, fields) {
                    console.log("Update: "+player_status)                 
                });
                dispatcher.pause();
                msg.reply(':pause_button: Pause');
            }
        }
        else if(parser[0] == 'skip'){
            if(dispatcher != null && dispatcher.paused == false){
                console.log('Skip playing!');
                dispatcher.pause()
                dispatcher = null // end the stream
                await remove_first(msg, connection);
                queue = await db_queue(msg, connection);
                if(queue.length != 0){
                    var temp_player = await player(msg, voice_connection, ytdl, connection, player_status)
                    
                    dispatcher = temp_player[0]
                    player_status = temp_player[1]
                }
            }
        }
        else if(parser[0] == 'resume'){
            if(dispatcher != null && dispatcher.paused == true){
                player_status = "resume"
                dispatcher.resume();
                msg.channel.send(':play_pause: Resume');
            }
            else{
                msg.channel.send("No pause");
            }
        }
        else if(parser[0] == 'stop'){
            if(dispatcher != null){
                dispatcher.pause();
                dispatcher = null;
                player_status = "stop";
                var temp_sql_array = [player_status]
                var temp_sql_data = temp_sql_array.join()
                connection.query('UPDATE server set server_voice_data = "'+temp_sql_data+'" WHERE server_voice_id = "'+msg.member.voice.channel.id+'" ', function (error, results, fields) {
                    console.log("update: stop")                 
                });
                remove_all(msg, connection)
                msg.channel.send(':stop_button: Stop');
            }
        }
        else if(parser[0] == 'queue'){
            queue = await db_queue(msg, connection)
            if(queue.length!=0){
                queue_text = ':coffee: Queue\n';
                var i = 1;
                if(queue.length != 0){
                    queue.forEach(item => {
                        queue_text += i+'. '+item.queue_url+'\n'
                        i++
                    });
                }    
                else{
                    queue_text = 'No song in queue';
                }
            }
            else{
                queue_text = "No song play";
            }
            console.log(queue)
            msg.channel.send(queue_text);
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

        return [voice_connection, dispatcher, player_status];
    }

    module.exports.exc = function(msg) {
        msg.content = msg.content.substring(1);
        return exc(msg);
    }

    module.exports.music_exc = async function(msg, voice_connection, dispatcher, is_play, is_end, is_connect, youtube, utf8, ytdl, queue, player_status, connection) {
        msg.content = msg.content.substring(1);
        var parser = exc(msg);
        return music_exc(msg, parser, voice_connection, dispatcher, is_play, is_end, is_connect, youtube, utf8, ytdl, queue, player_status, connection);
    }

}());
