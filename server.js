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

var purchaseOrderUnposterRouter = require('./src/routers/v1/purchasing/purchase-order/purchase-order-un-posted-router');
purchaseOrderUnposterRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/unposted')

//Purchase-order External
var purchaseOrderExternalRouter = require('./src/routers/v1/purchasing/purchase-order-external/purchase-order-external-by-user-router');
purchaseOrderExternalRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/externals/by-user')

var purchaseOrderExternalPostRouter = require('./src/routers/v1/purchasing/purchase-order-external/purchase-order-external-post-router');
purchaseOrderExternalPostRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/externals/post');

var purchaseOrderExternalCancelRouter = require('./src/routers/v1/purchasing/purchase-order-external/purchase-order-external-cancel-router');
purchaseOrderExternalCancelRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/externals/cancel');

var purchaseOrderExternalUnpostRouter = require('./src/routers/v1/purchasing/purchase-order-external/purchase-order-external-unpost-router');
purchaseOrderExternalUnpostRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/externals/unpost');

var purchaseOrderExternalCloseRouter = require('./src/routers/v1/purchasing/purchase-order-external/purchase-order-external-close-router');
purchaseOrderExternalCloseRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/externals/close');

var purchaseOrderExternalRouter = require('./src/routers/v1/purchasing/purchase-order-external/purchase-order-external-router');
purchaseOrderExternalRouter().applyRoutes(server, 'v1/purchasing/purchase-orders-externals');

var purchaseOrderExternalsUnpostedRouter = require('./src/routers/v1/purchasing/purchase-order-external/purchase-order-external-posted-router');
purchaseOrderExternalsUnpostedRouter().applyRoutes(server, 'v1/purchasing/purchase-orders/externals/posted');

//Delivery Orders (Surat Jalan)
var deliveryOrderByUserRouter = require('./src/routers/v1/purchasing/delivery-order/delivery-order-by-user-router');
deliveryOrderByUserRouter().applyRoutes(server, 'v1/purchasing/delivery-orders/by-user');

var deliveryOrderBySupplierRouter = require('./src/routers/v1/purchasing/delivery-order/delivery-order-by-supplier-router');
deliveryOrderBySupplierRouter().applyRoutes(server, 'v1/purchasing/delivery-orders/by-supplier');

//unit receipt note (Bon Terima Unit)		
var unitReceiptNoteByUserRouter = require('./src/routers/v1/purchasing/unit-receipt-note/unit-receipt-note-by-user-router');
unitReceiptNoteByUserRouter().applyRoutes(server, '/v1/purchasing/unit-receipt-notes/by-user');

var unitPaymentOrderSupplierRouter = require('./src/routers/v1/purchasing/unit-receipt-note/unit-receipt-note-suplier-unit-router');
unitPaymentOrderSupplierRouter().applyRoutes(server, '/v1/purchasing/unit-receipt-notes/by-supplier-unit');

//unit payment order (surat perintah bayar)
var unitPaymentOrderByUserRouter = require('./src/routers/v1/purchasing/unit-payment-order/unit-payment-order-by-user-router');
unitPaymentOrderByUserRouter().applyRoutes(server, 'v1/purchasing/unit-payment-orders/by-user');

var unitPaymentOrderReadAllRouter = require('./src/routers/v1/purchasing/unit-payment-order/unit-payment-order-read-all-data-router');
unitPaymentOrderReadAllRouter().applyRoutes(server, 'v1/purchasing/unit-payment-orders/read-all');

//Master Discount
var masterDiscountRouter = require('./src/routers/v1/inventory/master/discount-router');
masterDiscountRouter().applyRoutes(server, 'v1/inventory/master-discount');

var masterDiscountItemRouter = require('./src/routers/v1/inventory/master/discount-filter-router');
masterDiscountItemRouter().applyRoutes(server, 'v1/inventory/master-discount/filter');

// Correction of Purchasing Price
var priceCorrectionByUserRouter = require('./src/routers/v1/purchasing/price-correction/price-correction-by-user-router');
priceCorrectionByUserRouter().applyRoutes(server, 'v1/purchasing/corrections/prices/by-user');

var quantityCorrectionByUserRouter = require('./src/routers/v1/purchasing/quantity-correction/quantity-correction-by-user-router');
quantityCorrectionByUserRouter().applyRoutes(server, 'v1/purchasing/corrections/quantities/by-user');

var quantityCorrectionReturRouter = require('./src/routers/v1/purchasing/quantity-correction/quantity-correction-retur-router');
quantityCorrectionReturRouter().applyRoutes(server, 'v1/purchasing/corrections/quantities/retur');

server.listen(process.env.PORT, process.env.IP);
console.log(`server created at ${process.env.IP}:${process.env.PORT}`)