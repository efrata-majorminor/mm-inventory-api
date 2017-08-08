var Router = require('restify-router').Router;;
var router = new Router();
var map = require('bateeq-module').inventory.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var passport = require('../../../passports/jwt-passport');
const apiVersion = '1.0.0';

router.get('/:module', passport, (request, response, next) => {
    db.get().then(db => {

        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);
        var filter;
        var stores = [];
        for (var i = 0; i < request.user.stores.length; i++) {
            stores.push(request.user.stores[i].code);
        }

        var units = [];
        for (var unitCode in request.user.permission) {
            units.push(unitCode);
        }

        var query = request.query;
        if (module === "efr-tb-bbt") {
            var moduleId = "EFR-TB/BBT";
            filter = {
                "code": {
                    '$regex': new RegExp("^[A-Z0-9]+\/" + moduleId + "\/[0-9]{2}\/[0-9]{4}$", "i")
                },
                "destination.code":
                {
                    $in: stores
                }
            };
        }

        if (module === "efr-tb-bbp") {
            var moduleId = "EFR-TB/BBP";
            filter = {
                "code": {
                    '$regex': new RegExp("^[A-Z0-9]+\/" + moduleId + "\/[0-9]{2}\/[0-9]{4}$", "i")
                },
                "destination.code":
                {
                    $in: units
                }
            };
        }

        if (module === "efr-tb-bat") {
            var moduleId = "EFR-TB/BAT";
            filter = {
                "code": {
                    '$regex': new RegExp("^[A-Z0-9]+\/" + moduleId + "\/[0-9]{2}\/[0-9]{4}$", "i")
                },
                "destination.code":
                {
                    $in: stores
                }
            };
        }

        if (module === "efr-kb-rtp") {
            var moduleId = "EFR-KB/RTP";
            var regexModuleId = new RegExp(moduleId, "i");
            filter = {
                "code": {
                    '$regex': regexModuleId
                },
                "source.code":
                {
                    $in: stores
                }
            };
        }
        if (module === "efr-kb-rtt") {
            var moduleId = "EFR-KB/RTT";
            var regexModuleId = new RegExp(moduleId, "i");
            filter = {
                "code": {
                    '$regex': regexModuleId
                },
                "source.code":
                {
                    $in: stores
                }
            };
        }

        if (module === "efr-kb-rtu") {
            var moduleId = "EFR-KB/RTU";
            var regexModuleId = new RegExp(moduleId, "i");
            filter = {
                "code": {
                    '$regex': regexModuleId
                },
                "source.code":
                {
                    $in: units
                }
            };
        }

        if (module === "efr-kb-exp") {
            var moduleId = "EFR-KB/EXP";
            var regexModuleId = new RegExp(moduleId, "i");
            filter = {
                "code": {
                    '$regex': regexModuleId
                },
                "_createdBy": request.user.username
            };
        }

        query.filter = filter;
        query.order = {
            "_createdDate": -1
        };
        if (module === "efr-kb-exp") {
            query.select = ["code", "expedition.name", "weight", "date", "spkDocuments", "_createdBy"]
        } else {
            query.select = [
                "code", "reference", "source.name", "source.code", "destination.code", "destination.name", "_createdDate", "_createdBy"
            ];
        }


        manager.read(query)
            .then(docs => {
                if (module === "efr-kb-exp") { 
                    for (var i = 0; i < docs.data.length; i++) {
                        docs.data[i].spkDocuments = docs.data[i].spkDocuments[0].destination.name; 
                    }
                }
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

router.get('/:module/:id', (request, response, next) => {
    db.get().then(db => {

        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, {
            username: 'router'
        });

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

router.post('/:module', passport, (request, response, next) => {
    db.get().then(db => {

        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var data = request.body;

        manager.create(data)
            .then(docId => {
                response.header('Location', `inventories/docs/${module}/${docId.toString()}`);
                var result = resultFormatter.ok(apiVersion, 201);
                response.send(201, result);
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

        manager.update(data)
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

router.del('/:module/:id', passport, (request, response, next) => {
    db.get().then(db => {

        var module = request.params.module;
        var Manager = map.get(module);
        var manager = new Manager(db, request.user);

        var id = request.params.id;
        var data = request.body;

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
});


module.exports = router;