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
    var createName = req.body.createName
    db.getOneData(createName, (result) => {
        if (result) {
            console.log("data exist")
            res.redirect('/data/create')
        } else {
            db.createOneData(createName, 1, (result) => {
                console.log("created" + createName)
                res.redirect('/data/all')
            })
        }
    })
})

router.post('/add', (req, res) => {
    // ToDO: add new version data 
    console.log(req.body.method)
    console.log(req.body.dataName)
    var data_name =  req.body.dataName
    res.redirect('/data/add/' + data_name)
    
})

router.get('/add/:id', function (req, res, next) {
    var data_name = req.params.id;
    db.getOneData(data_name, (data_data) => {
        db.getNewstVersion(data_name, (newest_version) => {
            var new_version = newest_version + 1
            db.getContentAndHistories(data_name, newest_version, (results) => {
                var histories = results[0]
                var contents = results[1]
                res.render('data_new_version.ejs',
                    {
                        data: data_data,
                        new_version: new_version,
                        histories: histories,
                        contents: contents
                    }
                )
            })

        })
    })

});

router.get('/check', function (req, res, next) {
    res.send('after add and check page');
});

router.get('/show/:id', function (req, res) {
    var data_name = req.params.id;
    var version_content = req.query.ver

    if (!version_content) {
        version_content = -1
    }

    db.getOneData(data_name, (result_data) => {
        if (result_data) {
            db.getContentAndHistories(data_name, version_content, (results_history_and_content) => {

                var histories = results_history_and_content[0];
                var contents = results_history_and_content[1];
                var version_sql = results_history_and_content[2][0]["max_version"];


                if (version_content != -1) {
                    version_sql = version_content
                }

                res.render('data_detail.ejs', {
                    data: result_data,
                    histories: histories,
                    contents: contents,
                    current_version: version_sql,
                })
            })
        } else {
            res.send(`no data`);
        }
    })
});

module.exports = router;
