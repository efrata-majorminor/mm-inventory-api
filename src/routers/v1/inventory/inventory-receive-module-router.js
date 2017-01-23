var Router = require('restify-router').Router;;
var router = new Router();
var map = require('bateeq-module').inventory.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');
const apiVersion = '1.0.0';

router.get('/efr-tb-bbt/pending',passport, (request, response, next) => {
    db.get().then(db => {
       var Manager = map.get("efr-tb-bbt");
        var manager = new Manager(db, request.user);
        
        var query = request.query;

        manager.readPendingSPK(query)
            .then(docs => { 
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/efr-tb-bat/pending',passport, (request, response, next) => {
    db.get().then(db => {
       var Manager = map.get("efr-tb-bat");
        var manager = new Manager(db, request.user);
        var query = request.query;

        manager.readPendingSPK(query)
            .then(docs => { 
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});



router.get('/efr-tb-bbt/pending/:id',passport, (request, response, next) => {
    db.get().then(db => {
       var Manager = map.get("efr-tb-bbt");
        var manager = new Manager(db, request.user);
        var id = request.params.id;

        manager.getPendingSPKById(id)
            .then(docs => { 
                var result = resultFormatter.ok(apiVersion, 200, docs);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/efr-tb-bat/pending/:id',passport, (request, response, next) => {
    db.get().then(db => {
       var Manager = map.get("efr-tb-bat");
        var manager = new Manager(db, request.user);
        var id = request.params.id;

        manager.getPendingSPKById(id)
            .then(docs => { 
                var result = resultFormatter.ok(apiVersion, 200, docs);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});


module.exports = router;