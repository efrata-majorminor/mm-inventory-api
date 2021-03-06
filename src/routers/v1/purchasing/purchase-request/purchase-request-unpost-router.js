const apiVersion = '1.0.0';
var Router = require('restify-router').Router;
var db = require('../../../../db');
var resultFormatter = require("../../../../result-formatter");
var Manager = require("mm-module").purchasing.PurchasingRequestManager;
var passport = require('../../../../passports/jwt-passport');

function getRouter() {
    var router = new Router();
    router.put('/:id', passport, (request, response, next) => {
        db.get().then(db => {
            var manager = new Manager(db, request.user);

            var id = request.params.id;

            manager.unpost(id)
                .then(docId => {
                    response.header('Location', `${docId.toString()}`);
                    var result = resultFormatter.ok(apiVersion, 201);
                    response.send(201, result);
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