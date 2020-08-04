(function() {


    var FgBlack = "\x1b[30m"
    var FgRed = "\x1b[31m"
    var FgGreen = "\x1b[32m"
    var FgYellow = "\x1b[33m"
    var FgBlue = "\x1b[34m"
    var FgMagenta = "\x1b[35m"
    var FgCyan = "\x1b[36m"
    var FgWhite = "\x1b[37m"

    var BgBlack = "\x1b[40m"
    var BgRed = "\x1b[41m"
    var BgGreen = "\x1b[42m"
    var BgYellow = "\x1b[43m"
    var BgBlue = "\x1b[44m"
    var BgMagenta = "\x1b[45m"
    var BgCyan = "\x1b[46m"
    var BgWhite = "\x1b[47m"

    module.exports.log = async function(text, color = null, bg = null) {
        if(color!=null){
            if(color == 'green'){
                color = FgGreen;
            }
            if(color == 'red'){
                color = FgRed;
            }
        }
        else{
            color = FgCyan;
        }

        if(bg!=null){
            bg = '%s'
            if(color == 'red'){
                bg += BgRed;
            }
            if(color == 'green'){
                bg += BgGreen;
            }
        }
        else{
            bg = '%s\x1b[0m';
        }
        console.log(color+bg, text)
    }

}());