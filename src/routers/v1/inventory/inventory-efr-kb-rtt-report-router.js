var Router = require('restify-router').Router;
var router = new Router();
var map = require('bateeq-module').inventory.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var ObjectId = require('mongodb').ObjectId;
var passport = require('../../../passports/jwt-passport');

const apiVersion = '1.0.0';

router.get('/', passport, (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-kb-rtt"); 
        var manager = new Manager(db, request.user); 

        var datefrom = request.params.datefrom;
        var dateto = request.params.dateto;
        var status = request.params.status;

        var query = request.query; 
        var filter = { 
            date: {
                $gte: new Date(datefrom),
                $lte: new Date(dateto)
            },
             "code": {
                        '$regex': new RegExp("^[A-Z0-9]+\/EFR-KB/RTT\/[0-9]{2}\/[0-9]{4}$", "i")
                    }
        };  
        query.filter = {
            '$and': [
                query.filter,
                filter 
            ]
        };

        
        manager.readAll(query)
            .then(docs => {
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
});

module.exports = router;