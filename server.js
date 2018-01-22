'use strict';

var restify = require('restify');
restify.CORS.ALLOW_HEADERS.push('authorization');

var passport = require('passport');
var server = restify.createServer();

var json2xls = require('json2xls');
server.use(json2xls.middleware);

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({
    headers: ['Content-Disposition']
}));

server.use(passport.initialize());
server.use(function (request, response, next) {
    var query = request.query;
    query.order = !query.order ? {} : JSON.parse(query.order);
    query.filter = !query.filter ? {} : JSON.parse(query.filter);
    request.queryInfo = query;
    next();
});


var storageInventoryRouter = require('./src/routers/v1/inventory/storage-inventory-router');
storageInventoryRouter.applyRoutes(server, "v1/inventory/storages");

var storageInventoryMovementRouter = require('./src/routers/v1/inventory/storage-inventory-movement-router');
storageInventoryMovementRouter.applyRoutes(server, "v1/inventory/storages");

var storageInventoryMovementRouter = require('./src/routers/v1/inventory/inventory-ro-report-router');
storageInventoryMovementRouter.applyRoutes(server, "v1/inventory/inventory-ro-report");

var transferInDocRouter = require('./src/routers/v1/inventory/transfer-in-doc-router');
transferInDocRouter.applyRoutes(server, "v1/inventory/docs/transfer-in");

var transferOutDocRouter = require('./src/routers/v1/inventory/transfer-out-doc-router');
transferOutDocRouter.applyRoutes(server, "v1/inventory/docs/transfer-out");

var adjustmentDocRouter = require('./src/routers/v1/inventory/adjustment-doc-router');
adjustmentDocRouter.applyRoutes(server, "v1/inventory/docs/adjustment");

var inventoryEfrKbRtpModuleRouter = require('./src/routers/v1/inventory/inventory-efr-kb-rtp-module-router');
inventoryEfrKbRtpModuleRouter.applyRoutes(server, "v1/inventory/docs/efr-kb-rtp");

var inventoryEfrKbRtpModuleRouter = require('./src/routers/v1/inventory/inventory-efr-kb-rtu-module-router');
inventoryEfrKbRtpModuleRouter.applyRoutes(server, "v1/inventory/docs/efr-kb-rtu");

var inventoryEfrKbRttReportRouter = require('./src/routers/v1/inventory/inventory-efr-kb-rtt-report-router');
inventoryEfrKbRttReportRouter.applyRoutes(server, "v1/inventory/docs/efr-kb-rtt/:datefrom/:dateto/:status");

var inventoryEfrKbExpReportRouter = require('./src/routers/v1/inventory/inventory-efr-kb-exp-report-router');
inventoryEfrKbExpReportRouter.applyRoutes(server, "v1/inventory/docs/efr-kb-exp/report");

var inventoryReceiveModuleRouter = require('./src/routers/v1/inventory/inventory-receive-module-router');
inventoryReceiveModuleRouter.applyRoutes(server, "v1/inventory/docs");

var inventoryDocModuleRouter = require('./src/routers/v1/inventory/inventory-doc-module-router');
inventoryDocModuleRouter.applyRoutes(server, "v1/inventory/docs");

var packingListreportRouter = require('./src/routers/v1/merchandiser/merchandiser-packing-list-report-router');
packingListreportRouter.applyRoutes(server, "v1/merchandiser/docs/report");

var merchandiserDocModuleSpecifyRouter = require('./src/routers/v1/merchandiser/merchandiser-doc-module-specify-router');
merchandiserDocModuleSpecifyRouter.applyRoutes(server, "v1/merchandiser/docs");

var merchandiserDocModuleRouter = require('./src/routers/v1/merchandiser/merchandiser-doc-module-router');
merchandiserDocModuleRouter.applyRoutes(server, "v1/merchandiser/docs");

var uploadPbjRouter = require('./src/routers/v1/merchandiser/upload-csv-file-pbj-router');
uploadPbjRouter.applyRoutes(server, "v1/merchandiser/upload");

var uploadPbaRouter = require('./src/routers/v1/merchandiser/upload-csv-file-pba-router');
uploadPbaRouter.applyRoutes(server, "v1/merchandiser/upload/pba");

var uploadFGRouter = require('./src/routers/v1/inventory/upload-finishgoods-router');
uploadFGRouter.applyRoutes(server, "v1/inventory/upload-finishgoods");

var stockOpnameRouter = require('./src/routers/v1/inventory/stock-opname-doc-router');
stockOpnameRouter.applyRoutes(server, "v1/inventory/stock-opnames");

var stockAvailabilityRouter = require('./src/routers/v1/inventory/stock-availability-router');
stockAvailabilityRouter.applyRoutes(server, "v1/inventory/stock-availability");

var monthlyStockRouter = require('./src/routers/v1/inventory/monthly-stock-router');
monthlyStockRouter.applyRoutes(server, "v1/inventory/monthly-stock");

// Purchasing 
var purchaseRequestRouter = require('./src/routers/v1/purchasing/purchase-request/purchase-request-by-user-router');
purchaseRequestRouter().applyRoutes(server, 'v1/purchasing/purchase-requests/by-user');

var purchaseRequestPostRouter = require('./src/routers/v1/purchasing/purchase-request/purchase-request-post-router');
purchaseRequestPostRouter().applyRoutes(server, 'v1/purchasing/purchase-requests/post');

var purchaseRequestUnpostRouter = require('./src/routers/v1/purchasing/purchase-request/purchase-request-unpost-router');
purchaseRequestUnpostRouter().applyRoutes(server, 'v1/purchasing/purchase-requests/unpost');

var purchaseRequestPostedRouter = require('./src/routers/v1/purchasing/purchase-request/purchase-request-posted-router');
purchaseRequestPostedRouter().applyRoutes(server, 'v1/purchasing/purchase-requests/posted');

//purchase-order
var purchaseOrderRouter = require('./src/routers/v1/purchasing/purchase-order/purchase-order-by-user-router');
purchaseOrderRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/by-user');

var purchaseOrderSplitRouter = require('./src/routers/v1/purchasing/purchase-order/purchase-order-split-router');
purchaseOrderSplitRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/split');


server.listen(process.env.PORT, process.env.IP);
console.log(`server created at ${process.env.IP}:${process.env.PORT}`)