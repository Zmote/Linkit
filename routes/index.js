var express = require('express');
var router = express.Router();
var db = require("../database.js");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('main', { title: 'Express' });
});

/* POST to database */
router.put('/Links', function(req,res){
  if(db.validateURL(req.body)){
    db.saveLink(req.body);
    console.log("Position marker");
    res.status(200).send('Everything went OK');
  }else{
    res.status(500).send({message:"Server Responds: Invalid URL"});
  }
  //db.saveLink(req.body);
});

/* POST up-vote for specific entry */
router.post('/Links/:id/Up', function(req,res){
  db.updateDBEntryUp(req.body);
  res.status(200).send("Succesfully updated DB");
});

/* POST down-vote for specific entry */
router.post('/Links/:id/Down', function(req,res){
  db.updateDBEntryDown(req.body);
  res.status(200).send("Succesfully updated DB");
});

/* DELETE down-vote for specific entry */
router.delete('/Links/:id/', function(req,res){
  db.removeEntryFromDB(req.body);
  res.status(200).send("Succesfully deleted entry from DB");
});

/* GET database */
router.get('/Links', function(req,res){
  db.readFromDBFile(function(data){
    res.send(data);
  })
});

module.exports = router;
