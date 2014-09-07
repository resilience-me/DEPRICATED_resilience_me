//lists an accounts outgoing and incoming transactions


var ripple = require('ripple-lib');
var util   = require('util');

var remote = new ripple.Remote({
    trace: false,
    trusted:  true,
    local_signing:  true,
    servers: [{
        host:    's1.ripple.com'
        , port:    443
        , secure:  true
    }]
});

remote.connect(function() {

    var params = {
        'account': "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ",
        'ledger_index_min': -1,
        'ledger_index_max': -1,
        'limit': 20
    };

    remote.request_account_tx(params)
        .on('success', function(data) {

            console.log("++++++++++");
            console.log("marker.ledger=" + data.marker.ledger);
            console.log("marker.seq=" + data.marker.seq);
            console.log("++++++++++");

            for (var i=0; i < data.transactions.length; i++) {

                console.log("===========");
                var tx = data.transactions[i].tx;
                var meta = data.transactions[i].meta;
                var timestamp = ripple.utils.toTimestamp(data.transactions[i].tx.date);
                var date = new Date(timestamp);

                if (tx.TransactionType === 'Payment') {
                    console.log("dateLocale=" + date.toLocaleString());
                    console.log("TransactionResult=" + meta.TransactionResult);
                    console.log("TransactionType=" + tx.TransactionType);
                    console.log("Account=" + tx.Account);
                    console.log("Amount=" + ripple.Amount.from_json(tx.Amount).to_text_full());
                    console.log("Destination=" + tx.Destination);
                    console.log("Ledger Index=" + tx.ledger_index);
                }
            }

        }).request();
});
