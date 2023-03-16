var express = require('express');
var router = express.Router();
const db = require('./../db')

/* GET home page. */
router.get('/', function (req, res) {
  res.render('home.ejs', {
    messages: req.flash('info')
  })
});

router.get('/flash', function (req, res) {
  req.flash('info', 'Flash is back!')
  res.redirect('/');
});



module.exports = router;
