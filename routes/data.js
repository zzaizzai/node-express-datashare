var express = require('express');
var router = express.Router();
const db = require('./../db')

router.get('/', function (req, res, next) {
    res.send('data main page ');
});

router.get('/all', function (req, res) {

    const search = req.query.search
    if (search == "" || !search) {
        db.getAllData((results) => {
            res.render('data_all.ejs', {
                allData: results,
            })
        })
    } else {

        console.log("no search")
        db.getResearchData(search, (results) => {
            res.render('data_all.ejs', { allData: results, search: search })
        })
    }
});



router.get('/create', function (req, res, next) {
    res.render('data_create.ejs', { message: req.flash("message") });
});

router.post('/create', function (req, res) {
    const createName = req.body.createName

    if (createName == "" | !createName) {
        req.flash("message", "Enter some data name")
        res.redirect('/data/create')
        return
    } else {
        db.getOneData(createName, (result) => {

            if (result) {
                req.flash("message", "Data already exists")
                res.redirect('/data/create')
                return

            } else {
                db.createOneData(createName, 1, (result) => {
                    console.log("created" + createName)
                    res.redirect('/data/all')
                    return
                })
            }
        })
    }
})

router.post('/checkdone', (req, res) => {

    const data_name = req.body.dataName
    const values = req.body.value
    const methods = req.body.method
    const version_new = req.body.version
    const version_text = req.body.versionText

    db.newHistoryOfData(version_new, data_name, version_text, 1, (result) => {
        db.saveMethodsAndValues(data_name, version_new, methods, values, 1)
        res.redirect('/data/show/' + data_name)
    })
})

router.post('/add', (req, res) => {

    const methods = req.body.method
    var values = req.body.value
    var data_name = req.body.dataName
    var vertsion_text = req.body.versionText
    var data_version = req.query.version
    let counts = 0;

    console.log("creating " + data_name + " ver:" + data_version)

    var new_contents = []
    for (var i = 1; i < methods.length; i++) {
        if (methods[i] == "" || values[i] == "") {
            continue
        }
        console.log(i, "method:", methods[i], "values:", values[i])
        counts += 1
        new_contents.push({ method: methods[i], value: values[i] })

    }

    if (counts == 0) {
        req.flash("message", "You need to add some data")
        res.redirect('/data/add/' + data_name)
    } else {

        db.getOneData(data_name, (result) => {

            var data = result

            db.getNewstVersion(data_name, (newest_version) => {
                var new_version = newest_version + 1
                db.getContentAndHistories(data_name, newest_version, (results) => {

                    var histories = results[0]
                    histories.unshift({ version: data_version, text: vertsion_text })

                    res.render('data_check.ejs',
                        {
                            data: data,
                            new_version: new_version,
                            histories: histories,
                            contents: new_contents,
                            current_version: data_version,
                        }
                    )
                })
            })
        })
    }
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
                        contents: contents,
                        message: req.flash("message")
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

    console.log(req.flash("message"))
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
                var version_current = results_history_and_content[2][0]["max_version"];

                if (version_content != -1) {
                    version_current = version_content
                }

                var data_current;
                for (let i = 0; i < histories.length; i++) {
                    if (histories[i].version == version_current) {
                        data_current = histories[i]
                    }
                }
                // no certain version data
                if (!data_current) {
                    res.redirect('/data/show/' + data_name)
                    return
                }

                res.render('data_detail.ejs', {
                    data: result_data,
                    histories: histories,
                    contents: contents,
                    current_version: version_current,
                    data_current: data_current
                })
            })
        } else {
            res.send(`no data`);
        }
    })
});

module.exports = router;
