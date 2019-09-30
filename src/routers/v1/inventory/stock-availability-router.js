var Router = require('restify-router').Router;;
var router = new Router();
var StockAvailabilityManager = require('mm-module').inventory.StockAvailabilityManager;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');

const apiVersion = '1.0.0';

router.get('/storage/:inventoryId', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new StockAvailabilityManager(db, request.user);
        var inventoryId = request.params.inventoryId;

        manager.getNearestStock(inventoryId)
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

router.get('/:storageId', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new StockAvailabilityManager(db, request.user);
        var storageId = request.params.storageId;

        manager.getStorageStock(storageId)
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

module.exports = router;