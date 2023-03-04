var express = require('express');
var router = express.Router();
const db = require('./../db')

/* GET home page. */
router.get('/', function (req, res, next) {
  db.getTest((result)=> {
    res.render('home.ejs', {test: result})

  })
  // db.conntion.query(
  //     'select * form test where =? ',[1] , 
  //     (error, results) => {
  //       res.render('home.ejs', { title: 'Express'});
  //     }
  //   )




});

module.exports = router;
