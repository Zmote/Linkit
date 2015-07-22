/**
 * Created by Zmote on 08.07.2015.
 */
var fs = require('fs');
var objArray =  readFromDBFile(function(data){
        return data;
    }) || [];

/**
 * Speichert das übergebene Objekt in der Datenbank
 * Notiz für Zukunft: sobald writeToDB ausserhalb
 * des readFromDBFile-Blockes platziert wird,
 * wird es an den anfang gehoisted(wie auch alle anderen
 * Instruktionen), darum wurde die Datenbank immer resettet.
 * */
function saveLink(obj){
    readFromDBFile(function(data){
        try{
            objArray = JSON.parse(data);
            //unshift pushes entries on top, the other way would be with push
            objArray.unshift(obj);
            writeToDB(objArray);
        }catch(err){
            console.log(err);
        }
    });
}

function readFromDBFile(callback){
    fs.readFile('../public/database/urls.json',"utf8", function(err,data){
        if(err){
            console.log(err);
        }else{
            callback(data);
        }
    })
}

function writeToDB(obj){
    fs.writeFile('../public/database/urls.json', JSON.stringify(obj, null, 4), 'utf8', function (err) {
        if (err) {
            console.log("Something went wrong!")
        } else {
            console.log("Succesful save accomplished. Gambata Zafer-san!");
        }

    })

}

function removeEntryFromDB(obj){
    readFromDBFile(function(data){
        var dataParsed = JSON.parse(data);
        for(var i = 0; i < dataParsed.length;i++){
            if(dataParsed[i].url === obj.url && dataParsed[i].user === obj.user){
                console.log(i);
                dataParsed.splice(i,1);
            }
        }
        writeToDB(dataParsed);
    })
}

function updateDBEntryUp(obj){
    readFromDBFile(function(data){
        var dataParsed = JSON.parse(data);

        /**
         * Iterates over the returned array and checks
         * if url and user match with any of the entry url and user
         * */
        for(var i = 0; i < dataParsed.length;i++){
            if(dataParsed[i].user === obj.user && dataParsed[i].url === obj.url){
                if(dataParsed[i]['positive[]'].indexOf(obj.user) > -1){
                    console.log("This user has already voted up once");
                }else{

                    /**
                     * Checks if the user's name is already in the negative's array
                     * in which case it ONLY removes it from there and doesn't add
                     * the name to the positive roster. Basically this step is like
                     * removing your vote and attainig your 1-vote point
                     * */
                    if(dataParsed[i]['negative[]'].indexOf(obj.user) > -1){
                        for(var j = 0; j < dataParsed[i]['negative[]'].length;j++){
                            if(dataParsed[i]['negative[]'][j] == obj.user){
                                dataParsed[i]['negative[]'].splice(j,1);
                            }
                        }
                    }else{
                        dataParsed[i]['positive[]'].push(obj.user);
                    }

                    dataParsed[i]["counter"] = dataParsed[i]['positive[]'].length - dataParsed[i]['negative[]'].length;
                    writeToDB(dataParsed);
                }
            }
        }
    })
}

function updateDBEntryDown(obj){
    readFromDBFile(function(data){
        var dataParsed = JSON.parse(data);

        /**
         * Iterates over the returned array and checks
         * if url and user match with any of the entry url and user
         * */
        for(var i = 0; i < dataParsed.length;i++){
            if(dataParsed[i].user === obj.user && dataParsed[i].url === obj.url){
                if(dataParsed[i]['negative[]'].indexOf(obj.user) > -1){
                    console.log("This user has already voted down once");
                }else{

                    /**
                     * Checks if the user's name is already in the positive's array
                     * in which case it ONLY removes it from there and doesn't add
                     * the name to the negative roster. Basically this step is like
                     * removing your vote and attainig your 1-vote point
                     * */
                    if(dataParsed[i]['positive[]'].indexOf(obj.user) > -1){
                        for(var j = 0; j < dataParsed[i]['positive[]'].length;j++){
                            if(dataParsed[i]['positive[]'][j] == obj.user){
                                dataParsed[i]['positive[]'].splice(j,1);
                            }
                        }
                    }else{
                        dataParsed[i]['negative[]'].push(obj.user);
                    }
                    //Mögliche Erweiterung: Die Wiederberechnung des Counters unabhänging machen und bei jedem Aufruf
                    //von updateAllLinks() separat aufrufen. Aber jetzt nicht zwingend wichtig noch nötig.
                    //Ist eher für den Fall gedacht, falls jemand manuell im urls.json herumspielt.
                    dataParsed[i]["counter"] = dataParsed[i]['positive[]'].length - dataParsed[i]['negative[]'].length;
                    writeToDB(dataParsed);
                }
            }
        }
    })

}

/**
 *Validtes URL server-side and returns true or false
 * with which it decided if it should save the link
 * or not. --> Could be done with the next feature
 * */
function validateURL(obj){
    if(re_weburl.test(obj.url)){
        return true;
    }else{
        return false;
    }
}

module.exports = {
    saveLink: saveLink,
    readFromDBFile: readFromDBFile,
    updateDBEntryUp:updateDBEntryUp,
    updateDBEntryDown:updateDBEntryDown,
    removeEntryFromDB:removeEntryFromDB,
    validateURL:validateURL
};

var re_weburl = new RegExp(
    "^" +
        // protocol identifier
    "(?:(?:https?|ftp)://)" +
        // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
        // IP address exclusion
        // private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
        // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
        // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
        // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
        // TLD may end with dot
    "\\.?" +
    ")" +
        // port number
    "(?::\\d{2,5})?" +
        // resource path
    "(?:[/?#]\\S*)?" +
    "$", "i"
);