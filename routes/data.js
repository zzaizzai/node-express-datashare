var express = require('express');
var router = express.Router();
const db = require('./../db')


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('data main page ');
});

router.get('/all', function (req, res, next) {
    db.getAllData((results) => {
        res.render('data_all.ejs', { allData: results })
    })
});

router.get('/create', function (req, res, next) {
    res.render('data_create.ejs');
});

router.post('/create', function (req, res) {
    db.createDate(req.body.createName, 1, (result) => {
        res.redirect('/data/all')
    })
})

router.get('/add', function (req, res, next) {
    res.send('add data exist data page');
});

router.get('/check', function (req, res, next) {
    res.send('after add and check page');
});

router.get('/show/:id', function (req, res) {
    var id = req.params.id;
    db.getOneData(id, (results) => {
        if (results[0]) {
            res.render('data_detail.ejs', { data: results[0] })
        } else {
            res.send(`no data`);
        }
    })
});

module.exports = router;
