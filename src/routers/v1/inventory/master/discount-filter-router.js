const apiVersion = '1.0.0';
var db = require('../../../../db');
var Router = require('restify-router').Router;
var resultFormatter = require("../../../../result-formatter");
var passport = require('../../../../passports/jwt-passport');
var Manager = require("bateeq-module").inventory.master.DiscountManager;

function getRouter() {
    var router = new Router();
    router.get('/item/:code', passport, (request, response, next) => {
        db.get().then(db => {
            var manager = new Manager(db, request.user);

            var code = request.params.code;
            var filter = { 'items.itemsDetails.code': code, '_deleted' : false };

            manager.getDiscountByFilter(filter)
                .then(result => {
                    var data = result;
                    var result = resultFormatter.ok(apiVersion, 200, data);
                    response.send(200, result);
                })
                .catch(e => {
                    var error = resultFormatter.fail(apiVersion, 400, e);
                    response.send(400, error);
                })
        });
    });

    router.get('/date/:date', passport, (request, response, next) => {
        db.get().then(db => {
            var manager = new Manager(db, request.user);

            var code = request.params.code;
            var date =  request.params.date;

            var filter = {
                'startDate': {
                    $lte: new Date(date)
                },
                'endDate': {
                    $gte: new Date(date)
                },
                '_deleted': false
            };

            manager.getDiscountByFilter(filter)
                .then(result => {
                    var data = result;
                    var result = resultFormatter.ok(apiVersion, 200, data);
                    response.send(200, result);
                })
                .catch(e => {
                    var error = resultFormatter.fail(apiVersion, 400, e);
                    response.send(400, error);
                })
        });
    });
    return router;
}
module.exports = getRouter;