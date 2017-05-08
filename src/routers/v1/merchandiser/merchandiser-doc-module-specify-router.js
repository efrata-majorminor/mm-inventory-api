var Router = require('restify-router').Router;;
var router = new Router();
var map = require('bateeq-module').merchandiser.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');
const apiVersion = '1.0.0';

router.get('/efr-pk/pending', (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-pk");
        var manager = new Manager(db, {
            username: 'router'
        });
        var query = request.query;
        manager.readNotReceivedAndDraft(query)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                delete docs.data;
                result.info = docs;
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});


router.get('/efr-pk/received', (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-pk");
        var manager = new Manager(db, {
            username: 'router'
        });
        var query = request.query;
        manager.readReceived(query)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                delete docs.data;
                result.info = docs;
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.post('/:module/drafted', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);
        var data = request.body;
        manager.createDraft(data)
            .then(docId => {
                response.header('Location', `merchandisers/docs/${module}/draft/${docId.toString()}`);
                var result = resultFormatter.ok(apiVersion, 201);
                response.send(201, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.get('/efr-pk/rtt', (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-pk");
        var manager = new Manager(db, {
            username: 'router'
        });

        var query = request.query;

        manager.readByReference(query)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                delete docs.data;
                result.info = docs;
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/efr-pk/expedition', (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-pk");
        var manager = new Manager(db, {
            username: 'router'
        });

        var query = request.query;

        manager.readForExpedition(query)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                delete docs.data;
                result.info = docs;
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});


module.exports = router;