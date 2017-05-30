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
        var Manager = map.get("inv-ro-report");
        var manager = new Manager(db, request.user);
        var codeRO = request.params.codeRO;
        
        manager.getROItem(codeRO)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs);
                result.info = docs;
                response.send(200, result);
            }).catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    });
});

module.exports = router;