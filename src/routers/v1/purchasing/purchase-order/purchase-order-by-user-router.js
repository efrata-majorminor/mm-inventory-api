const apiVersion = '1.0.0';
var Manager = require("mm-module").purchasing.PurchasingOrderManager;
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
        // defaultSelect: ["unit.division.name", "unit.name", "category.name", "purchaseRequest.date", "purchaseRequest.no", "purchaseRequest.expectedDeliveryDate", "_createdBy", "purchaseOrderExternal.isPosted", "isPosted"]
        defaultSelect: []
    });
    return router;
}
module.exports = getRouter;