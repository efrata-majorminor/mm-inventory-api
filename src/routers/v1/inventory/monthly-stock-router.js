var Router = require('restify-router').Router;;
var router = new Router();
var MonthlyStockManager = require('mm-module').inventory.MonthlyStockManager;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');

const apiVersion = '1.0.0';

router.get('/:storageCode/:month/:year', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new MonthlyStockManager(db, {
            username: "monthlyStock"
        });
        var storageCode = request.params.storageCode;
        var month = request.params.month;
        var year = request.params.year;

        manager.getStockInStorage(storageCode, month, year)
            .then(docs => {
                if ((request.headers.accept || '').toString().indexOf("application/xls") < 0) {
                    var data = docs;
                    var result = resultFormatter.ok(apiVersion, 200, data);
                    response.send(200, result);
                } else {
                    var data = [];
                    for (const doc of docs) {
                        const _data = {
                            "Kode Toko": storageCode,
                            "Nama": doc.storageName,
                            "Barcode": doc.itemCode,
                            "Nama Barang": doc.itemName,
                            "Kuantitas": doc.quantity,
                            "Total HPP": doc.totalHPP,
                            "Total Harga Jual": doc.totalSale
                        }
                        data.push(_data);
                    }
                    var options = {
                        "Kode Toko": "string",
                        "Nama": "string",
                        "Barcode": "string",
                        "Nama Barang": "string",
                        "Kuantitas": "number",
                        "Total HPP": "number",
                        "Total Harga Jual": "number"
                    };
                    response.xls(`Report Monthly Stock.xlsx`, data, options);
                }
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            });
    });
});

router.get('/:month/:year', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new MonthlyStockManager(db, {
            username: "monthlyStock"
        });
        var month = request.params.month;
        var year = request.params.year;

        manager.getOverallStock(month, year)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            });
    });
});

router.get('/', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new MonthlyStockManager(db, {
            username: "monthlyStock"
        });

        manager.getYearMonthList()
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            });
    });
});


module.exports = router;