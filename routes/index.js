var express = require('express');
var router = express.Router();
const db = require('./../db')

/* GET home page. */
router.get('/', function (req, res, next) {
  db.getTest((result) => {
    res.render('home.ejs', { test: result })
  })

});

module.exports = router;
