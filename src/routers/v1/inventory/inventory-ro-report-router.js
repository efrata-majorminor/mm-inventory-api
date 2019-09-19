var Router = require('restify-router').Router;
var router = new Router();
var map = require('mm-module').inventory.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var ObjectId = require('mongodb').ObjectId;
var passport = require('../../../passports/jwt-passport');

const apiVersion = '1.0.0';

/**
 * This method is to get realization item from
 * realization order code.
 */
router.get('/:codeRO', passport, (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("report-manager");
        var manager = new Manager(db, request.user);
        var codeRO = request.params.codeRO;

        manager.getReportItemsByRealizationOrder(codeRO)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs);
                result.info = docs;
                response.send(200, result);
            }).catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            });
    });
});

router.get('/:codeRO/xls', passport, (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("report-manager");
        var manager = new Manager(db, request.user);
        var codeRO = request.params.codeRO;
        var tempArr = [];
        var size = [];

        manager.getReportItemsByRealizationOrder(codeRO)
            .then(dataResult => {
                var data = [];
                var moment = require('moment');
                var dateFormat = "DD MMM YYYY";

                for (var dataItem of dataResult) {
                    if (!data[dataItem.storageName]) {
                        data[dataItem.storageName] = {};
                        data[dataItem.storageName]["Toko"] = dataItem.storageName;
                    }

                    data[dataItem.storageName]["Stok Ukuran " + dataItem.itemDetail.size] = dataItem.itemDetail.quantityOnInventory;
                    data[dataItem.storageName]["Stok Terjual Ukuran " + dataItem.itemDetail.size] = dataItem.itemDetail.quantityOnSales;
                }

                for (var dataItem of dataResult) {
                    if (data[dataItem.storageName]) {
                        if (!data[dataItem.storageName]["Total Stok"] && !data[dataItem.storageName]["Total Stok Terjual"]) {
                            data[dataItem.storageName]['Umur'] = dataItem.age;
                            data[dataItem.storageName]["Total Stok"] = 0;
                            data[dataItem.storageName]["Total Stok Terjual"] = 0;
                        }
                        data[dataItem.storageName]["Total Stok"] += dataItem.itemDetail.quantityOnInventory;
                        data[dataItem.storageName]["Total Stok Terjual"] += dataItem.itemDetail.quantityOnSales;
                    }
                }

                var props = Object.getOwnPropertyNames(data);

                for (var i = 1; i < props.length; i++) {
                    tempArr.push(data[props[i]]);
                }

                data = tempArr;

                if ((request.headers.accept || '').toString().indexOf("application/xls") < 0) {
                    var result = resultFormatter.ok(apiVersion, 200, dataResult);
                    response.send(200, result);
                } else {
                    response.xls(`Report Stok with RO ${codeRO} - ${moment(new Date()).format(dateFormat)}.xlsx`, data);
                }
            }).catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            });
    });
});
module.exports = router;