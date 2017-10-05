var Router = require('restify-router').Router;
var router = new Router();
var map = require('bateeq-module').inventory.map;
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
        var Manager = map.get("inv-ro-report");
        var manager = new Manager(db, request.user);
        var codeRO = request.params.codeRO;

        manager.getROItem(codeRO)
            .then(docs => {
                var tableHeader = [];
                var data = []
                var moment = require('moment');
                var dateFormat = "DD MMM YYYY";

                for (var items of docs) {
                    var _data = {
                        " ": items._id
                    };

                    for (var i = 0; i < items.items.length; i++) {
                        var roItems = items.items[i];

                        if (tableHeader.indexOf(roItems.item) === -1) {
                            tableHeader.push(roItems.item);
                        }

                        console.log(roItems.quantity);

                        _data[roItems.item] = roItems.quantity;

                        for (var j = 0; j < items.items.length; j++) {
                            if (roItems.itemcode !== items.items[j].itemcode && roItems.item === items.items[j].item) {
                                _data[roItems.item] += items.items[j].quantity;
                            }
                        }
                    }
                    data.push(_data);
                }

                for (var head of tableHeader) {
                    for (var item of data) {
                        if (!item.hasOwnProperty(head)) {
                            item[head] = 0;
                        }
                    }
                }
                
                if ((request.headers.accept || '').toString().indexOf("application/xls") < 0) {
                    var result = resultFormatter.ok(apiVersion, 200, docs);
                    response.send(200, result);
                } else {
                    response.xls(`Report Stok RO - ${moment(new Date()).format(dateFormat)}.xlsx`, data);
                }
            }).catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            });
    });
});
module.exports = router;