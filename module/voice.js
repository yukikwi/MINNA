(function() {

    var exc = function(msg){
        var split_msg = msg.content.split(/ (.+)/);
        return [split_msg[0] , split_msg[1]];
    }

    var player = async function(queue, voice, ytdl, player_status){
        var url = queue[0];
        console.log('playing: '+url);
        dispatcher = voice.play(ytdl(url, 'highestaudio'));

        dispatcher.on('finish', () => {
            console.log('End playing!');
            dispatcher = null // end the stream
            queue.shift();
            if(queue.length != 0){
                player(queue, voice, ytdl)
            }
            else{
                voice.disconnect()
                player_status = false;
            }
        });		
        
        return [dispatcher, player_status];
    }

    var music_exc = async function(msg, parser, voice_connection, dispatcher, is_play, is_end, is_connect, validUrl, youtube, utf8, ytdl, queue, player_status){
        
        if(parser[0] != 'exit' && is_connect == false){
            console.log('**********************************')
            console.log('voice connection...')
            console.log('**********************************')
            voice_connection = await msg.member.voice.channel.join();
            is_connect = true;
        }
        
        if(parser[0] == 'play'){
            parser[1] = utf8.encode(parser[1])
            if(validUrl.isUri(parser[1])){
                queue.push(parser[1])
            }
            else{
                var search = await youtube.searchVideos(parser[1]);
                queue.push("https://www.youtube.com/watch?v="+search.id)
            }

            console.log('**********************************')
            console.log(queue)
            console.log(queue.length);
            console.log('**********************************')
            
            if(player_status == false){
                temp_player = await player(queue, voice_connection, ytdl, player_status)
                dispatcher = temp_player[0]
                player_status = temp_player[1]
            }

        }
        else if(parser[0] == 'pause'){
            if(dispatcher != null && dispatcher.paused == false){
                dispatcher.pause();
                msg.channel.send('Pause');
            }
        }
        else if(parser[0] == 'skip'){
            if(dispatcher != null && dispatcher.paused == false){
                console.log('Skip playing!');
                dispatcher = null // end the stream
                queue.shift();
                if(queue.length != 0){
                    player(queue, voice_connection, ytdl)
                }
            }
        }
        else if(parser[0] == 'resume'){
            if(dispatcher != null && dispatcher.paused == true){
                is_play = true;
                dispatcher.resume();
                msg.channel.send('Resume');
            }
            else{
                msg.channel.send("No pause");
            }
        }
        else if(parser[0] == 'stop'){
            if(dispatcher != null){
                dispatcher.pause();
                dispatcher = null;
                player_status = false;
                queue = [];
                msg.channel.send('Stop');
            }
            console.log(queue)
        }
        else if(parser[0] == 'queue'){
            if(player_status == true){
                queue_text = '';
                var i = 1;
                if(queue.length != 0){
                    queue.forEach(item => {
                        queue_text += i+'. '+item+'\n'
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

        return [is_play, is_end, voice_connection, is_connect, dispatcher, queue, player_status];
    }

    module.exports.exc = function(msg) {
        msg.content = msg.content.substring(1);
        return exc(msg);
    }

    module.exports.music_exc = function(msg, voice_connection, dispatcher, is_play, is_end, is_connect, validUrl, youtube, utf8, ytdl, queue, player_status) {
        msg.content = msg.content.substring(1);
        var parser = exc(msg);
        return music_exc(msg, parser, voice_connection, dispatcher, is_play, is_end, is_connect, validUrl, youtube, utf8, ytdl, queue, player_status);
    }

}());
