var express = require('express');
var router = express.Router();
const db = require('./../db')

/* GET home page. */
router.get('/', function (req, res, next) {
  db.getTest((result) => {
    res.render('home.ejs', {
      test: result,
      messages: req.flash('info')
    })
  })

});

router.get('/flash', function (req, res) {
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!')
  res.redirect('/');
});



module.exports = router;
