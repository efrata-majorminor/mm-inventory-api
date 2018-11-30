var Router = require('restify-router').Router;;
var SOBalanceManager = require('bateeq-module').inventory.StockOpnameBalanceManager;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');
const apiVersion = '1.0.0';
const country = 'id';
var moment = require('moment');

function getRouter() {
    var router = new Router();
    router.get('/storage/:code', passport, (request, response, next) => {
        db.get().then(db => {
            var manager = new SOBalanceManager(db, request.user);
            var code = request.params.code;

            manager.getBalanceByStorageCode(code)
                .then(doc => {
                    
                    var result = resultFormatter.ok(apiVersion, 200, doc);
                    response.send(200, result);
                })
                .catch(e => {
                    var error = resultFormatter.fail(apiVersion, 400, e);
                    response.send(400, error);
                });
        });
    });
    return router;
}
module.exports = getRouter;