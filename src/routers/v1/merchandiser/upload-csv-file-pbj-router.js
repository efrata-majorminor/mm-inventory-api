var Router = require('restify-router').Router;;
var router = new Router();
var map = require('bateeq-module').merchandiser.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");

var fs = require('fs');
var csv = require('fast-csv');

const apiVersion = '1.0.0';
router.post('/', (request, response, next) => {

    db.get().then(db => {
        var dataCsv = [];
        var dataAll;
        var module = "efr-pk-pbj";
        var Manager = map.get(module);
        var manager = new Manager(db, {
            username: 'router'
        });

        fs.createReadStream(request.files.fileUpload.path)
            .pipe(csv())
            .on('data', function (data) {
                dataCsv.push(data); 
            })
            .on('end', function (data) {
                dataAll=dataCsv; 
                manager.insert(dataAll, request.params.sourceId, request.params.destinationId, request.params.date)
                    .then(doc => {
                        var result = resultFormatter.ok(apiVersion, 200, doc);
                        response.send(200, result);
                    })
                    .catch(e => {
                        var error = resultFormatter.fail(apiVersion, 400, e);
                        response.send(400, error);
                    })
            });
    })
});

module.exports = router;