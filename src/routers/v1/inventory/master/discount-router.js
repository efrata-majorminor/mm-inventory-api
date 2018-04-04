const apiVersion = '1.0.0';
var db = require('../../../../db');
var resultFormatter = require("../../../../result-formatter");
var passport = require('../../../../passports/jwt-passport');
var Manager = require("bateeq-module").inventory.master.DiscountManager;

var JwtRouterFactory = require("../../jwt-router-factory");

function getRouter() {

    var router = JwtRouterFactory(Manager, {
        version: apiVersion,
        defaultOrder: {
            "_updatedDate": -1
        },
        defaultFilter: (request, response, next) => {
            return {
                "_createdBy": request.user.username
            };
        },
        defaultSelect: []
    });

    var route = router.routes["get"].find(route => route.options.path === "/:id");
    route.handlers[route.handlers.length - 1] = function (request, response, next) {
        var id = request.params.id;
        db.get()
            .then(db => {
                var manager = new Manager(db, request.user);
                return Promise.resolve(manager);
            })
            .then((manager) => {
                return manager.getSingleByIdOrDefault(id);
            })
            .then((doc) => {
                var result;
                if (!doc) {
                    result = resultFormatter.fail(apiVersion, 404, new Error("data not found"));
                }
                else {
                    result = resultFormatter.ok(apiVersion, 200, doc);
                }
                return Promise.resolve(result);
            })
            .then((result) => {
                response.send(result.statusCode, result);
            })
            .catch((e) => {
                var statusCode = 500;
                if (e.name === "ValidationError")
                    statusCode = 400;
                var error = resultFormatter.fail(apiVersion, statusCode, e);
                response.send(statusCode, error);
            });
    };
    return router;
}

module.exports = getRouter;