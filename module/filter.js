const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
var wordcut = require("wordcut");
wordcut.init();

(function() {

    function filter_check(msg, word, mysql_connection){
        return new Promise(function(resolve, reject) {
            mysql_connection.query('SELECT word FROM filter_word WHERE server = ? AND word LIKE ?', [msg.member.guild.id, word], function(error, result, fields){
                if (error) {
                    return reject(error);
                }
                
                if(result.length != 0){
                    resolve(true)
                }
                else{
                    resolve(false)
                }
            })
        });
    }

    function filter_status(msg, mysql_connection){
        return new Promise(function(resolve, reject) {
            mysql_connection.query('SELECT status FROM filter_status WHERE server_id = ? ', [msg.member.guild.id], function(error, result, fields){
                if (result.length == 0 || result[0].status == 0) {
                    resolve(false)
                }
                else{
                    resolve(true)
                }
            });
        });
    }

    function action_filter_status(msg, mysql_connection, mode){
        return new Promise(function(resolve, reject) {
            mysql_connection.query('SELECT status FROM filter_status WHERE server_id = ? ', [msg.member.guild.id], function(error, result, fields){
                if (result.length == 0) {
                    mysql_connection.query("INSERT INTO `filter_status` (`server_id`, `status`) VALUES (?, ?);", [msg.member.guild.id, mode],  function(error, result, fields){
                        if(!error){
                            resolve(true)
                        }
                        else{
                            resolve(false)
                        }
                    })
                }
                else{
                    mysql_connection.query("UPDATE `filter_status` SET `status` = ? WHERE `filter_status`.`server_id` = ? ", [mode, msg.member.guild.id],  function(error, result, fields){
                        if(!error){
                            resolve(true)
                        }
                        else{
                            resolve(false)
                        }
                    })
                }
            });
        });
    }

    async function filter_rm_db(word, msg, mysql_connection){
        var data_filter_status = await filter_status(msg, mysql_connection)
        var exsite = await filter_check(msg, word, mysql_connection)
        if(data_filter_status == false){
            return "filter_disable"
        }
        else if(exsite == true){
            return "filter_exsite"
        }
        else{
            return new Promise(function(resolve, reject){
                mysql_connection.query('DELETE FROM `filter_word` WHERE word = ? AND server = ?', [word, msg.member.guild.id], function(error, result){
                    if(error){
                        resolve(false)
                    }
                    else{
                        resolve(true)
                    }
                })
            })
        }
    }

    async function filter_add_db(word, msg, mysql_connection){
        var data_filter_status = await filter_status(msg, mysql_connection)
        var exsite = await filter_check(msg, word, mysql_connection)
        if(data_filter_status == false){
            return "filter_disable"
        }
        else if(exsite == true){
            return "filter_exsite"
        }
        else{
            return new Promise(function(resolve, reject) {
                mysql_connection.query('INSERT INTO `filter_word` (`filter_id`, `word`, `server`, `action`, `action_by`) VALUES (NULL, ?, ?, "", "") ', [word, msg.member.guild.id], function(error, result, fields){
                    if (error) {
                        resolve(false)
                    }
                    else{
                        resolve(true)
                    }
                });
            });
        }
    }

    async function filtering(input, msg, mysql_connection){
        input = input.trim()
        if(/^[ก-๙]/ig.test(input)){
            var arr_word = wordcut.cut(input)

            arr_word = arr_word.split("|")
        }
        else{
            arr_word = input.split(" ")
        }

        var found = 0;
        console.log("Filter: parse ["+arr_word+"]")
        console.log("Filter: search in "+msg.member.guild.id)

        for(var i = 0; i < arr_word.length; i++){
            var check = await filter_check(msg, arr_word[i], mysql_connection);
            if(check == true){
                console.log(arr_word[i])
                found++;
            }
        }

        if(found != 0){
            return true;
        }
        else{
            return false;
        }
    }

    async function filter_add(msg, connection, word){
        var add_to_db = await filter_add_db(word, msg, connection)
        if(add_to_db === true){
            return "Add filter"
        }
        else if(add_to_db === false){
            return "Fail to add filter"
        }
        else if(add_to_db === "filter_exsite"){
            return "Filter exsite"
        }
        else if(add_to_db === "filter_disable"){
            return "Filter not enable"
        }
        else{
            return "Bot Internal Error"
        }
    }

    async function filter_rm(msg, connection, word){
        var rm_status = await filter_rm_db(word, msg, connection)
        if(rm_status === true){
            return "Remove filter"
        }
        else if(rm_status === "filter_unexsite"){
            return "Filter not found"   
        } 
        if(rm_status === "filter_disable"){
            return "Filter not enable"
        }
        else{
            return "Can't remove filter"
        }
    }

    async function filter_toggle(msg, mysql_connection, mode){
        if(mode != "on" && mode != "off"){
            return "Help: /filter [on/off]"
        }
        else{
            if(mode == 'on'){
                mode = 1;
                var str_res = "Filter on"
            }
            else{
                mode = 0;
                var str_res = "Filter off"
            }
            var action = await action_filter_status(msg, mysql_connection, mode)
            if(action == true){
                return [str_res, mode];
            }
            else{
                return ["Bot Internal Error", false]
            }
        }
    }

    module.exports.filter = async function(msg, connection) {
        return filtering(msg.content, msg, connection)
    }

    module.exports.filter_route = function(msg, connection) {
        msg.content = msg.content.substring(1);
        var temp = msg.content.split(" ")
        if(temp[0] == "add_filter"){
            return filter_add(msg, connection, temp[1])
        }
        else if(temp[0] == "rm_filter"){
            return filter_rm(msg, connection, temp[1])
        }
        else if(temp[0] == "filter"){
            return filter_toggle(msg, connection, temp[1])
        }
    }

    module.exports.filter_status = async function(msg, connection) {
        return filter_status(msg, connection)
    }

}());