var Router = require('restify-router').Router;;
var router = new Router();
var map = require('bateeq-module').merchandiser.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');
var fs = require('fs');
var csv = require('fast-csv');

const apiVersion = '1.0.0';
router.post('/', passport, (request, response, next) => {
    var dateFormat = "DD MMM YYYY";
    var locale = 'id-ID';
    var moment = require('moment');
    moment.locale(locale);

    db.get().then(db => {
        var dataCsv = [];
        var dataAll;
        var module = "efr-pk-pba";
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        fs.createReadStream(request.files.fileUpload.path)
            .pipe(csv())
            .on('data', function (data) {
                dataCsv.push(data);
            })
            .on('end', function (data) {
                dataAll = dataCsv;
                if (dataAll[0][0] === "PackingList" && dataAll[0][1] === "Password" && dataAll[0][2] === "Barcode" && dataAll[0][3] === "Name" && dataAll[0][4] === "Size" && dataAll[0][5] === "Price" && dataAll[0][6] === "UOM" && dataAll[0][7] === "QTY" && dataAll[0][8] === "RO") {
                    manager.insert(dataAll, request.params.sourceId, request.params.destinationId, request.params.date)
                        .then(doc => {
                            if (doc[0]["Error"] === undefined) {
                                var result = resultFormatter.ok(apiVersion, 201, doc);
                                response.send(201, result);
                            }
                            else {
                                var options = {
                                    "PackingList": "string",
                                    "Password": "string",
                                    "Barcode": "string",
                                    "Name": "string",
                                    "Size": "string",
                                    "Price": "string",
                                    "UOM": "string",
                                    "QTY": "string",
                                    "RO": "string",
                                    "Error": "string"
                                };
                                response.xls(`Error Log-Pemasukan Barang Embalase ${moment(new Date()).format(dateFormat)}.xlsx`, doc, options);

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
    })
});

module.exports = router;