var Router = require('restify-router').Router;;
var router = new Router();
var SOManager = require('bateeq-module').inventory.StockOpnameDocManager;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');
var fs = require('fs');
var csv = require('fast-csv');
var ObjectId = require('mongodb').ObjectId;

const apiVersion = '1.0.0';

router.get('/item-inventory/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new SOManager(db, request.user);

        var id = request.params.id;

        manager.getAllItemInInventoryBySOId(id)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new SOManager(db, request.user);

        var query = request.query;

        manager.read(query)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                delete docs.data;
                result.info = docs;
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new SOManager(db, request.user);

        var id = request.params.id;

        manager.getSingleById(id)
            .then(doc => {
                var result = resultFormatter.ok(apiVersion, 200, doc);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.post('/', passport, (request, response, next) => {
    var dateFormat = "DD MMM YYYY";
    var locale = 'id-ID';
    var moment = require('moment');
    moment.locale(locale);

    db.get().then(db => {
        var dataCsv = [];
        var dataAll;
        var manager = new SOManager(db, request.user);
        var dataType = request.files.fileUpload.name.split(".");

        if (dataType[dataType.length - 1] === "csv") {
            fs.createReadStream(request.files.fileUpload.path)
                .pipe(csv())
                .on('data', function (data) {
                    dataCsv.push(data);
                })
                .on('end', function (data) {
                    dataAll = dataCsv;
                    var isTrue = true;
                    for (var a of dataAll) {
                        if (a.length > 3) {
                            isTrue = false;
                        }
                    }
                    if (dataAll[0][0] === "Barcode" && dataAll[0][1] === "Nama Barang" && dataAll[0][2] === "Kuantitas Stock" && isTrue) {
                        var data = {
                            dataFile: dataAll,
                            storageId: request.params.storageId
                        }
                        manager.create(data)
                            .then(doc => {
                                if (!doc.code) {
                                    var result = resultFormatter.ok(apiVersion, 201, doc);
                                    response.send(201, result);
                                } else {
                                    var result = resultFormatter.fail(apiVersion, 409, doc);
                                    response.send(409, result);
                                }
                            })
                            .catch(e => {
                                var error = resultFormatter.fail(apiVersion, 404, e);
                                response.send(404, error);
                            })
                    } else {
                        var error = resultFormatter.fail(apiVersion, 404, "");
                        response.send(404, error);
                    }
                });
        } else {
            var error = resultFormatter.fail(apiVersion, 412, "");
            response.send(412, error);
        }
    })
});

router.del('/:id', passport, (request, response, next) => {
    db.get().then(db => {

        var module = request.params.module;
        var manager = new SOManager(db, request.user);

        var id = request.params.id;

        manager.getSingleById(id)
            .then(doc => {
                manager.delete(doc)
                    .then(docId => {
                        var result = resultFormatter.ok(apiVersion, 204);
                        response.send(204, result);
                    })
                    .catch(e => {
                        var error = resultFormatter.fail(apiVersion, 400, e);
                        response.send(400, error);
                    })
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.put('/:id', passport, (request, response, next) => {
    db.get().then(db => {

        var module = request.params.module;
        var manager = new SOManager(db, request.user);

        var id = request.params.id;
        var data = request.body;

        manager.update(data)
            .then(docId => {
                var result = resultFormatter.ok(apiVersion, 204);
                response.send(204, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

module.exports = router;