var Router = require('restify-router').Router;
var router = new Router();
var map = require('bateeq-module').inventory.map;
var db = require('../../../db');
var resultFormatter = require("../../../result-formatter");
var ObjectId = require('mongodb').ObjectId;
var passport = require('../../../passports/jwt-passport');

const apiVersion = '1.0.0';

router.get('/:dateFrom/:dateTo/:transaction/:storageId/:packingListStatus', passport, (request, response, next) => {
    db.get().then(db => {
        var Manager = map.get("efr-kb-exp");
        var manager = new Manager(db, request.user);

        var filter = {
            dateFrom: new Date(request.params.dateFrom),
            dateTo: new Date(request.params.dateTo),
            transaction: request.params.transaction || 0,
            packingListStatus: request.params.packingListStatus || 0,
            storageId: request.params.storageId
        }

        manager.readForPackingListReport(filter)
            .then(docs => {
                var dateFormat = "DD/MM/YYYY";
                var dateFormat2 = "DD MMM YYYY";
                var locale = 'id-ID';
                var moment = require('moment');
                moment.locale(locale);
                var data = [];

                for (var spk of docs) {
                    var totalQty = 0;
                    var totalPrice = 0;
                    for (var item of spk.items) {
                        totalQty += parseInt(item.quantity);
                        totalPrice += parseInt(item.quantity * item.item.domesticSale);
                    }
                    var _item = {
                        "Tanggal": moment(new Date(spk._createdDate)).format(dateFormat),
                        "Sumber Penyimpanan": spk.source.name,
                        "Tujuan Penyimpanan": spk.destination.name,
                        "Transaksi": filter.transaction == 0 ? "Pengiriman Barang Baru" : "Pengiriman Barang Baru Return",
                        "Packing List": spk.packingList,
                        "Status": filter.packingListStatus == 0 ? "Belum Masuk Ekspedisi" : "Sudah Masuk Ekspedisi",
                        "Jumlah Kuantitas Barang": totalQty,
                        "Jumlah Harga Jual": totalPrice
                    }
                    data.push(_item);
                }


                if ((request.headers.accept || '').toString().indexOf("application/xls") < 0) {
                    var result = resultFormatter.ok(apiVersion, 200, docs);
                    response.send(200, result);
                } else {
                    var options = {
                        "Tanggal": "string",
                        "Sumber Penyimpanan": "string",
                        "Tujuan Penyimpanan": "string",
                        "Transaksi": "string",
                        "Packing List": "string",
                        "Status": "string",
                        "Jumlah Kuantitas Barang": "number",
                        "Jumlah Harga Jual": "number"
                    };
                    response.xls(`Laporan Packing List - ${moment(new Date()).format(dateFormat2)}.xlsx`, data, options);
                }
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
})

module.exports = router;