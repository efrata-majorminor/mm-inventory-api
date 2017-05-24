var Router = require('restify-router').Router;
var router = new Router();
var map = require('bateeq-module').inventory.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var ObjectId = require('mongodb').ObjectId;
var passport = require('../../../passports/jwt-passport');
var moment = require('moment');

const apiVersion = '1.0.0';

router.get('/:storageId/:dateFrom/:dateTo/', passport, (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-kb-exp");
        var manager = new Manager(db, request.user);

        var packingListStatus = request.params.packingListStatus || 0;

        var filter = {
            dateFrom: new Date(request.params.dateFrom),
            dateTo: new Date(request.params.dateTo),
            transaction: request.params.transaction || 0,
            packingListStatus: packingListStatus == 1,
            storageId: request.params.storageId || ""
        }

        manager.getReport(filter).then(docs => {
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
})

router.get('/export/:storageId/:dateFrom/:dateTo/:transaction/:packingListStatus', passport, (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-kb-exp");
        var manager = new Manager(db, request.user);

        var packingListStatus = request.params.packingListStatus || 0;

        var filter = {
            dateFrom: new Date(request.params.dateFrom),
            dateTo: new Date(request.params.dateTo),
            transaction: request.params.transaction || 0,
            packingListStatus: packingListStatus,
            storageId: request.params.storageId
        }
        var dateFormat = "DD MMM YYYY";
        var locale = 'id-ID';

        manager.getReport(filter).then(docs => {
            var data = docs;
            var options = {
                "Tanggal": "string",
                "Sumber Penyimpanan": "string",
                "Tujuan Penyimpanan": "string",
                "Transaksi": "string",
                "Packing List": "string",
                "Status": "string",
                "Total Kuantitas Barang": "number",
                "Total harga Jual": "number",
            };

            var data = docs.data.map(item => {
                var details = item.spkDocuments.map(packinglist => {
                    var sendQuantity = 0;
                    var price = 0;

                    sendQuantity = packinglist.items.reduce((sum, curr) => parseInt(sum || 0) + parseInt(curr.sendQuantity || 0), 0);
                    price = packinglist.items.reduce((sum, curr) => parseInt(sum || 0) + parseInt(curr.item.domesticCOGS), 0);

                    return {
                        "Tanggal": moment(item.date).format("DD-MM-YYYY"),
                        "Sumber Penyimpanan": packinglist.source.name || "",
                        "Tujuan Penyimpanan": packinglist.destination.name || "",
                        "Packing List": packinglist.packingList,
                        "Transaksi": (packinglist.packingList.indexOf("EFR-KB/PLB") != -1 ? "Pengiriman Barang Baru" : "Pengiriman Barang Retur"),
                        "Status": (packinglist.isReceived ? "Sudah Diterima" : "Belum Diterima"),
                        "Total Kuantitas Barang": sendQuantity,
                        "Total harga Jual": price
                    }
                });

                return [].concat.apply([], details);
            })

            var statusCode = filter.packingListStatus ? "Sudah Diterima" : "Belum Diterima";
            var transactionCode = filter.transaction == 0 ? "Pengiriman Barang Baru" : "Pengiriman Barang Retur";

            data = [].concat.apply([], data);
            data = data.filter(function (item) {
                return item.Transaksi == transactionCode && item.Status == statusCode;
            });

            response.xls(`Report Distribusi Barang - ${moment(filter.dateFrom).format(dateFormat)} - ${moment(filter.dateTo).format(dateFormat)}.xlsx`, data, options);
        })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
})

module.exports = router;