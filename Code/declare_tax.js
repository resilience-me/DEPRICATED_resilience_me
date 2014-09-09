//scans an accounts incoming transactions
//for all currencies in wallet.currency
//and declares tax for the latest transaction




//================ Create wallet ================
//should be encoded with ripple-account secret key
//taxRate is written in decimal, 0.02 means 2%

    var wallet = [
        {
        'currency':'RES',
        'taxRate': 0.02
        },

        {
        'currency':'USD',
        'taxRate': 0.004
        },

        {
        'currency':'EUR',
        'taxRate': 0.01
        },

    ];
    
//================ create a string with wallet.currency ================

     var IOUs = "";

for (var ii = 0; ii < wallet.length; ii++) { 
    IOUs = IOUs + wallet[ii].currency + " ";
}


//================ BLOB for declare_tax ================


     var TAX_BLOB = {
         transaction_id: {},
         account: {},
         amount: {},
         currency: {},
         issuer: {},
         destination: {},
         taxRate: {},
         tax_amount: {}
     };


//================ some poignant variables ================
     var r=0;
     var taxRate;
     var tax_amount;
     
//================ account_tx params ================

     
      var params = {
        'account': "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ",
        'ledger_index_min': -1,
        'ledger_index_max': -1,
        'limit': 50
    };



//================ connect to Ripple ================


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

   



//================ get an accounts transaction history from ripple ================

    remote.request_account_tx(params)
        .on('success', function(data) {





            for (var i=0; i < data.transactions.length; i++) {

                var tx = data.transactions[i].tx;






//================ filter account_tx by incoming payments and wallet.currency ================
                if (tx.TransactionType === 'Payment' &&  IOUs.indexOf(tx.Amount.currency) > -1 && tx.Destination === params.account) {


//================ set taxRate ================
for (var iii = 0; iii < wallet.length; iii++) { 
    
    if (tx.Amount.currency === wallet[iii].currency) {
    taxRate = wallet[iii].taxRate;
    }
    
}




//================ declare_tax ================

                    tax_amount = taxRate * tx.Amount.value;
                    

                    TAX_BLOB.transaction_id = tx.hash;
                    TAX_BLOB.account = tx.Account;
                    TAX_BLOB.amount = tx.Amount.value;
                    TAX_BLOB.currency = tx.Amount.currency;
                    TAX_BLOB.issuer = tx.Amount.issuer;
                    TAX_BLOB.destination = tx.Destination;
                    TAX_BLOB.taxRate = taxRate;
                    TAX_BLOB.tax_amount = tax_amount;


                    //this sets how many transactions to declare_tax for
                    //this is set with the variable r
                    if (r <= 10) {
                        //these declare_tax objects are sent to resilience.me
                        //output should be sent to resilience.me-server
                        var output = JSON.stringify(TAX_BLOB, null, 2);
                        console.log(output);
                    }
                    r++;


               
               
                }

            }

        }).request();


});


