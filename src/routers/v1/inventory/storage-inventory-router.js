var Router = require('restify-router').Router;;
var router = new Router();
var StorageManager = require('mm-module').master.StorageManager;
var InventoryManager = require('mm-module').inventory.InventoryManager;
var InventoryMovementManager = require('mm-module').inventory.InventoryMovementManager;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");

const apiVersion = '1.0.0';

router.get('/:storageId/inventories', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        var storageId = request.params.storageId;
        var query = request.query;
        
        manager.readByStorageId(storageId,query)
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

router.get('/:storageId/inventories/:itemId', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        var storageId = request.params.storageId;
        var itemId = request.params.itemId;

        manager.getByStorageIdAndItemId(storageId, itemId)
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

//new

router.get('/items/:itemId', (request, response, next) => {
    db.get().then(db => {
        var manager = new InventoryManager(db, {
            username: 'router'
        });
        
        
        var itemId = request.params.itemId;

        manager.getInventoryByItem(itemId)
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

module.exports = router;