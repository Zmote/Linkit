(function(document,window){
    /**
     * Saves obj returned from the Server client-side.
     * */
    var serverObj;
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
/**
 * TODO: Fix session functionality(final problem)
 * TODO: (optional) Allow user registration only once under the same name.
 * TODO: Fix rendering of DELETE button, show only DELETE button on messages of the users
 * TODO: (optional) bind bootstraop framework
 * */
    window.onload = function(){

        updateAllLinks();

        $('#logout').click(function(){
            $.ajax({
                url:'/logout',
                method:'GET',
                success:function(){
                    window.location = '/';
                    console.log('Succesfully logged out');
                },
                error:function(){
                    console.log('Something went wrong while logging out');
                }
            })
        });

        $('#login').click(function(){
            window.location = '/users/login';
        });

        /**
         * Detects which element's voting arrows has been clicked
         * and fires respective functions to apply points.
         * */
        $("#messages").click(function(event){
            var username = $('#user_name').text();

            if(username != 'Guest'){

                var elem = event.target;

                /************************************************
                 * Detects if arrow up or arrow down of a post
                 * was clicked and retrieves the necessary
                 * informations, which it then sends to the
                 * server.
                 * **********************************************/
                if(elem.tagName == "IMG"){
                    var messageURL = $(elem).parent().next().find("a").attr("href");
                    var messageUser = $(elem).parent().next().find("div[class='user']").text();

                    if(elem.className === "arrow_vote up"){
                        $.ajax({
                            url: '/Links/:id/Up',
                            method:'POST',
                            data:{
                                url:messageURL,
                                user:messageUser,
                                currentUser:$('#user_name').text()
                            },
                            success:function(){
                                console.log("Successfully sent up-vote");
                                updateAllLinks();
                            },
                            error: function(err){
                                console.log(err);
                            }
                        });
                    }
                    if(elem.className === "arrow_vote down"){
                        $.ajax({
                            url: '/Links/:id/Down',
                            method:'POST',
                            data:{
                                url:messageURL,
                                user:messageUser,
                                currentUser:$('#user_name').text()
                            },
                            success:function(){
                                console.log("Successfully sent down-vote");
                                updateAllLinks();
                            },
                            error: function(err){
                                console.log(err);
                            }
                        });
                    }
                }

                /*********************************************
                 * Detects if Delete Button is clicked and
                 * retrieves the necessary information from
                 * the post it belongs to, which it then
                 * sends to the server.
                 * *******************************************/
                if(elem.tagName === "INPUT"){
                    var deleteURL = $(elem).prev().prev().next().find("a").attr("href");
                    //var deleteUser = $(elem).prev().prev().next().find("div[class='user']").text();

                    if(elem.className === "deleteButton"){
                        $.ajax({
                            url: '/Links/:id',
                            method:'DELETE',
                            data:{
                                url:deleteURL,
                                user:$('#user_name').text()
                            },
                            success:function(){
                                console.log("Successfully deleted entry");
                            },
                            error: function(err){
                                console.log(err);
                            }
                        });
                    }
                }
            }
        });

        $("#post_button").on("click", function(){
            if($('#user_name').text() != 'Guest'){
                saveUrl();
            }
        });
    };


    /******************************************
     * 1s-Abfrage-System, für parallele Einträge
     * von anderen Nutzern. Könnte man mit dem
     * Observer-Pattern so umstellen, dass nur
     * bei einer Änderung der Server ein Befehl
     * zum Aktualisieren schickt.
     * ****************************************/
    setInterval(function(){
        updateAllLinks();
    },1000);

    /**
     * Updates time since post have been
     * posted
     * */
    function updateTimePast() {
        if(!serverObj){
            return;
        }
        var currentTime = new Date().getTime();

        for(var i = 0; i < serverObj.length;i++){
            var timePast = currentTime - serverObj[i].date;
            $(".message_footer span")[i].innerHTML = convertTime(timePast);
        }
    }

    /**
     * Send new entry to server and save
     * it to DB of links
     * */
    function saveUrl(){
        var input_field = $("#input_field");
        var url = input_field.val();
        input_field.val("");

        if(!re_weburl.test(url)){
            input_field.addClass("warn");
            input_field.attr("placeholder", "Invalid URL");

            setTimeout(function(){
                input_field.removeClass("warn");
                input_field.attr("placeholder", "Enter your URL here http://...");
            },1000);
            return;
        }
        /**
         * Change id implementation to a combination of user+url, so
         * that you have to only filter for id later(you can "find" the id
         * out by combining url and username --> for now do a double check.
         * // WILL NOT IMPLEMENT
         * */
        var obj = {
            title: url,
            id: $('#user_name').text() + parseInt(new Date().getTime()),
            //TODO: This way of array initalization is very lame, fix this when you're finished.
            positive: ['System_Zafer', 'System_Cemil'],
            negative: ['System_Niyazi', 'System_Dogan'],
            counter: 0,
            url: url,
            user: $('#user_name').text(),
            date: new Date().getTime()
        };

        $.ajax({
            url: "/Links",
            method:"PUT",
            data: obj,
            success: function(){
                console.log("Successfully sent data");
                updateAllLinks();
            },
            error: function(data){
                var parsedData = JSON.parse(data.responseText);
                var errorDiv = $("#error");
                errorDiv.html(parsedData.message);
                errorDiv.addClass("warn");
                setTimeout(function(){
                    $("#error").removeClass("warn");
                },2000);
                console.log('Something went wrong');
            }
        });
    }

    /**
     * Converts time from milliseconds to respective time unit.
     * */
    function convertTime(time){
        if(time < 60000){
            return Math.round(time/1000) + " seconds";
        }
        if(time > 60000 && time < 3600000){
            return Math.round(time/60000) + " minutes";
        }
        if(time > 3600000 && time < 86400000){
            return Math.round(time/3600000) + " hours";
        }
        if(time > 86400000 && time < 31536000000){
            return Math.round(time/86400000) + " days";
        }
        if(time > 31536000000){
            return Math.round(time/31536000000) + " years";
        }
    }

    /**
     * Gets LinkListObject from the server
     * and recompile the html entry with the
     * obj content
     * */
    function updateAllLinks(){
        $.ajax({
            url: "/Links",
            method:"GET",
            success: function(data){
                console.log("Successfully received data");
                serverObj = data;

                var source = $('#clientTemplate').html();
                var template = Handlebars.compile(source);
                var output = template(data);

                $('#messages').html(output);
                updateTimePast();
            },
            error: function(){
                console.log("Something went wrong, data was not received");
            },
            dataType: "json"
        });
    }
})(document, window);