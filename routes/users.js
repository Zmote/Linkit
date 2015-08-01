var express = require('express');
var router = express.Router();
var user = require('../public/dbscripts/user.js');

/*GET login page*/
router.get('/login', function(req,res){
  res.render('login');
});

/*GET register page*/
router.get('/register', function(req,res){
  res.render('register');
});

/*POST register user */
router.post('/registerUser',function(req,res){
  user.saveUser(req.body,function(data){
    if(data.state){
      res.status(200).send(data.message);
    }else{
      res.status(400).send(data.message);
    }
  });
});

/*POST login user */
router.post('/checkLogin', function(req,res){
  user.checkLogin(req.body,function(data){
    if(data.state){
      req.session.anySessionContent = data.obj.username;
      res.status(200).send(data.message);
    }else{
      res.status(400).send(data.message);
    }
  })
});

module.exports = router;
