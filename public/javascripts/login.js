/*****************************
 * TODO: check if user already registered
 * TODO: login functionality; check if user exists, if yes, setSession and redirect to main
 * ***************************/
(function(document,window){

    window.onload = function(){

        /********************************
         * Takes the info from input and sends it to
         * the server for saving operations.
         * *****************************/
        $("#submit.register").click(function(){
            var username = $('#username').val();
            var password = $('#password').val();

            $.ajax({
                url:'/users/registerUser',
                method:'POST',
                data:{
                    username: username,
                    password: password
                },
                success: function(data){
                    /**
                     * Die status-message 200 und 400 versenden
                     * die Dateien scheinbar in verschiedenen Formaten
                     * interessant, darum hier der Unterschied.
                     * Einer muss geparst werden, der andere nicht.
                     * */
                    showWarning(data);
                    console.log('Transmitted succesfully user informations');
                },
                error:function(data,err){
                    showWarning(data.responseText);
                    console.log('Failed sending user user informations, see: ' + err);
                },
                dataType: "json"
            })
        });

        /*******************************************
         * Sends login data and checks if user exists
         * if exists, redirects to main page and
         * session is set.
         * *****************************************/
        $('#submit.login').click(function(){
            var username = $('#username').val();
            var password = $('#password').val();

            $.ajax({
                url:'/users/checkLogin',
                method:'POST',
                data:{
                    username: username,
                    password: password
                },
                success: function(data){
                    console.log('I was here: ' + data);
                    showWarning(data, function(){
                        window.location = '/';
                    });
                },
                error:function(data,err){
                    showWarning(data);
                    console.log('Failed sending user user informations, see: ' + err);
                }
            })
        });

        /*************************************
         * A simple message showing div that
         * pops up and informs the user.
         * ***********************************/
        function showWarning(message, callback){
            var warnWrapper = document.createElement('DIV');
            var warnDiv = document.createElement('DIV');
            var textDiv = document.createElement('DiV');
            textDiv.id = 'textDiv';
            warnWrapper.id = 'warnWrapper';
            warnDiv.id = 'warnDiv';
            warnWrapper.appendChild(warnDiv);
            warnDiv.appendChild(textDiv);

            $('#siteWrapper').append(warnWrapper);
            $('#textDiv').text(message);
            $('#warnDiv').addClass('fade');
            setTimeout(function(){
                $('#warnDiv').removeClass('fade').addClass('on');
            },200);
            setTimeout(function(){
                $('#warnDiv').removeClass('on').addClass('fade');
                setTimeout(function(){
                    $('#warnWrapper').remove();
                    callback();
                },1000);
            },3000);
        }
    }
})(document,window);