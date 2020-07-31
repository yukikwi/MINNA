(function() {

    var exc = function(msg){
        var split_msg = msg.content.split(/ (.+)/);
        return [split_msg[0] , split_msg[1]];
    }

    var music_exc = async function(msg, parser, voice_connection, dispatcher, is_play, is_end, validUrl, youtube, utf8, ytdl){
        if(parser[0] != 'exit'){
            voice_connection = await msg.member.voice.channel.join();
        }
        if(parser[0] == 'play'){
            is_play = true;
            is_end = false;
            parser[1] = utf8.encode(parser[1])
            if(validUrl.isUri(parser[1])){
                dispatcher = voice_connection.play(ytdl(parser[1], 'highestaudio'));
            }
            else{
                var search = await youtube.searchVideos(parser[1]);
                console.log("*********************")
                console.log("Search result")
                console.log(search.id)
                console.log(parser[1])
                console.log("*********************")
                dispatcher = voice_connection.play(ytdl("https://www.youtube.com/watch?v="+search.id, 'highestaudio'));
            }

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
    }

    module.exports.exc = function(msg) {
        msg.content = msg.content.substring(1);
        return exc(msg);
    }

    module.exports.music_exc = function(msg, voice_connection, dispatcher, is_play, is_end, validUrl, youtube, utf8, ytdl) {
        msg.content = msg.content.substring(1);
        var parser = exc(msg);
        music_exc(msg, parser, voice_connection, dispatcher, is_play, is_end, validUrl, youtube, utf8, ytdl);
    }

}());
