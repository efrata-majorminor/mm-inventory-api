var Router = require('restify-router').Router;
var router = new Router();
var map = require('bateeq-module').inventory.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var ObjectId = require('mongodb').ObjectId;
var passport = require('../../../passports/jwt-passport');

const apiVersion = '1.0.0';

router.get('/:storageId/:dateFrom/:dateTo/', passport, (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-kb-exp");
        var manager = new Manager(db, request.user);

        var packingListStatus = request.params.packingListStatus || 0;

        var filter = {
            dateFrom: new Date(request.params.dateFrom),
            dateTo: new Date(request.params.dateTo),
            transaction: request.params.transaction || 0,
            packingListStatus: packingListStatus == 1,
            storageId: request.params.storageId
        }

        manager.getReport(filter).then(docs => {
            var data = docs;
            if ((request.headers.accept || '').toString().indexOf("application/xls") < 0) {
                var result = resultFormatter.ok(apiVersion, 200, data);
                response.send(200, result);
            }
        })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
})

module.exports = router;