var fs = require('fs');
var objArray =  readFromDBFile(function(data){
        return data;
    }) || [];

function checkLogin(obj,callback){
    readFromDBFile(function(data){
        var objArray = JSON.parse(data);
        for(var i = 0; i < objArray.length; i++){
            if(objArray[i].username === obj.username){
                if(objArray[i].password === obj.password){
                    callback({
                        state:true,
                        message:'You are logged in, congratulations!',
                        obj:objArray[i]
                    });
                    return;
                }else{
                    callback({
                        state:false,
                        message: 'Wrong password!'
                    });
                    return;
                }
            }
        }
        callback({
            state:false,
            message:'User does not exist, please register!'
        })
    });
}

function saveUser(obj, callback){
    readFromDBFile(function(data){

        objArray = JSON.parse(data);

        /*******************************************
         *Checking the input data if they're correct
         * *****************************************/
        if(!obj.username && !obj.password){
            callback({
                state:false,
                message:"No username or password, please type username and password"
            })
        }else if(!obj.username){
            callback({
                state:false,
                message:"No username, please choose username"
            })
        }else if(!obj.password){
            callback({
                state:false,
                message:"No password entered, please type a password"
            })
        }else {
            //unshift pushes entries on top, the other way would be with push
            try {
                objArray.unshift(obj);
                writeToDB(objArray);
                callback({
                    state: true,
                    message: 'Succesfully registered'
                });
            }catch(err){
                console.log(err);
                callback({
                    state:false,
                    message:'Something went wrong writing the file'
                });
            }
        }
    });
}

function readFromDBFile(callback){
    fs.readFile('../public/database/users.json',"utf8", function(err,data){
        if(err){
            console.log(err);
        }else{
            callback(data);
        }
    })
}
function writeToDB(obj){
    fs.writeFile('../public/database/users.json', JSON.stringify(obj, null, 4), 'utf8', function (err) {
        if (err) {
            console.log("Something went wrong!")
        } else {
            console.log("Succesful save accomplished. Gambata Zafer-san!");
        }

    })

}

module.exports = {
    saveUser:saveUser,
    checkLogin:checkLogin
};