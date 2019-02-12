var Router = require('restify-router').Router;;
var router = new Router();
var map = require('bateeq-module').merchandiser.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');

const apiVersion = '1.0.0';
router.get('/:module/draft/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var id = request.params.id;

        manager.getSingleById(id)
            .then(doc => {
                var result = resultFormatter.ok(apiVersion, 200, doc);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.post('/:module', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var data = request.body;
        manager.create(data)
            .then(docId => {
                response.header('Location', `merchandisers/docs/${module}/${docId.toString()}`);
                var result = resultFormatter.ok(apiVersion, 201);
                response.send(201, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
}); 

router.del('/:module/draft/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var id = request.params.id;
        manager.getSingleById(id)
            .then(data => {
                manager.delete(data)
                    .then(docId => {
                        var result = resultFormatter.ok(apiVersion, 204);
                        response.send(204, result);
                    })
                    .catch(e => {
                        var error = resultFormatter.fail(apiVersion, 400, e);
                        response.send(400, error);
                    })
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.get('/:module/NotReceived', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);
        if (module === "efr-kb-rtt") {
        }
        var query = request.queryInfo;
        var sorting = {
            "_createdDate": -1
        };
        var moduleId = "EFR-KB/PLB";
        var filter = {
            _deleted: false,
            "isReceived": false,
            "packingList": {
                '$regex': new RegExp("^[A-Z0-9]+\/" + moduleId + "\/[0-9]{2}\/[0-9]{4}$", "i")
            }
        };
        query.filter = filter;
        query.order = sorting;
        query.select = [
            "code", "packingList", "password", "source.code", "source.name", "destination.code", "destination.name", "date", "isReceived", "isDraft"
        ];

        manager.readNotReceived(query)
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

router.get('/:module/packingRTT', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);
        if (module === "efr-kb-rtt") {
        }
        var query = request.queryInfo;
        var sorting = {
            "_createdDate": -1
        };
        //var moduleId = "EFR-KB/PLB";
        var moduleId = "EFR-KB/RTT";
        var filter = {
            _deleted: false,
         //   "isReceived": false,
            //"source.code":"GDG.01",
            //"packingList": {
                "reference": {
                '$regex': new RegExp("^[A-Z0-9]+\/" + moduleId + "\/[0-9]{2}\/[0-9]{4}$", "i")
            }
        };
        query.filter = filter;
        query.order = sorting;
        query.select = [
            "code", "packingList", "password", "source.code", "source.name", "destination.code", "destination.name", "reference", "_createdDate", "isReceived", "isDraft"    
           // "code", "packingList", "password", "source.code", "source.name", "destination.code", "destination.name", "date", "isReceived", "isDraft"
        ];

       manager.readNotReceived(query)
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

router.put('/:module/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var id = request.params.id;
        var data = request.body;

        manager.updateNotDraft(data)
            .then(docId => {
                var result = resultFormatter.ok(apiVersion, 204);
                response.send(204, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.get('/print/:module/:id', (request, response, next) => {
    db.get().then(db => {

        var module = request.params.module;
        var Manager = map.get(module);

        var id = request.params.id;
        var manager = new Manager(db, {
            username: request.user
        });

        manager.pdf(id).then(docBinary => {
            manager.getSingleById(id)
                .then(doc => {
                    var name = doc.code.split('/').join('-');
                    response.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename=${name}.pdf`,
                        'Content-Length': docBinary.length
                    });
                    response.end(docBinary);
                })
                .catch(e => {
                    var error = resultFormatter.fail(apiVersion, 400, e);
                    response.send(400, error);
                });
        });
    })
});

router.get('/:module/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var id = request.params.id;
        manager.getSingleById(id)
            .then(doc => {
                var result = resultFormatter.ok(apiVersion, 200, doc);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.get('/:module', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var query = request.queryInfo;
        var sorting = {
            "_createdDate": -1
        };
        var filter = {
            "isReceived": false
        };
        query.filter = filter;
        query.order = sorting;
        query.select = [
            "packingList", "password", "source.code", "source.name", "destination.code", "destination.name", "date", "isReceived", "reference"
        ];

        manager.read(query)
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

router.post('/:module/submitted', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var data = request.body;

        manager.create(data)
            .then(docId => {
                response.header('Location', `merchandisers/docs/${module}/${docId.toString()}`);
                var result = resultFormatter.ok(apiVersion, 201);
                response.send(201, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.put('/:module/draft/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var id = request.params.id;
        var data = request.body;

        manager.updateDraft(data)
            .then(docId => {
                var result = resultFormatter.ok(apiVersion, 204);
                response.send(204, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

module.exports = router;