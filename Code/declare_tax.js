//scans an accounts incoming transactions
//for all currencies in wallet.currency
//and declares tax for the latest transaction.




//================ Create wallet ================
//this is just an example-wallet.
//actual wallet should be encoded with ripple-account secret key.

//taxRate is written in decimal, 0.02 means 2%.



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
//this is used to filter taxation data by the currencies that the user wants to tax

     var IOUs = "";

for (var ii = 0; ii < wallet.length; ii++) { 
    IOUs = IOUs + wallet[ii].currency + " ";
}


     
//================ define parameters for the Ripple API ================

     
      var params = {
        'account': "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ",
        'ledger_index_min': -1,
        'ledger_index_max': -1,
        'limit': 50
    };

//================ and some other variables ================

     var taxRate;
     var tax_amount;

     var r = 0;
     var limit = 10;
     
     var TAX_BLOB = [];


//================ Connect to the Ripple API ================


var ripple = require('ripple-lib');

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

   


//================ first we get an accounts transaction history via the Ripple API ================

    remote.request_account_tx(params)
        .on('success', function(data) {



//================ now we filter data from the Ripple API.                       
//================ we want to scan all the transactions we requested from Ripple
//================ and filter out incoming transactions in 
//================ the currencies that the user wants to tax

        for (var i=0; i < data.transactions.length; i++) {

                var tx = data.transactions[i].tx;
        
        
            if (tx.TransactionType === 'Payment' && IOUs.indexOf(tx.Amount.currency) > -1 && tx.Destination === params.account) {


//================ we need to add data from the users Resilience.me-Wallet to the Ripple data
//================ we can use a loop to look up taxRate-values for each currency
//================ and add taxRate to every [i] transaction that is processed


             for (var iii = 0; iii < wallet.length; iii++) { 
    
                 if (tx.Amount.currency === wallet[iii].currency) {
                 taxRate = wallet[iii].taxRate;
                 }
             }    
          
          
//================ now that we have taxRate added to the transaction, we also calculate the tax_amount

              tax_amount = taxRate * tx.Amount.value;    


//================ now we have all the data from the Ripple API and from the Resilience.me-Wallet
//================ we store that data in the variable TAX_BLOB

         var TAX_DATA = {};
         TAX_DATA.transaction_id = tx.hash;
         TAX_DATA.account = tx.Account;
         TAX_DATA.amount = tx.Amount.value;
         TAX_DATA.currency = tx.Amount.currency;
         TAX_DATA.issuer = tx.Amount.issuer;
         TAX_DATA.destination = tx.Destination;
         TAX_DATA.taxRate = taxRate;
         TAX_DATA.tax_amount = tax_amount;

//================ if we only want to filter out the first couple of transactions
//================ set number of transactions with limit variable
//================ all transactions that should be sent to resilience.me-server are added to a TAX_BLOB


                    if (r <= limit) {
                        TAX_BLOB[r] = TAX_DATA;

                    }
                    


                    r++;
                    
                }//end of if() filter-per-taxRate script
                
                   





            }//end of var i loop
            
//================ we now have all the data we need in TAX_BLOB
//================ this data should be sent to the resilience.me-server
//================ I will add that script soon

                                    
                        var output = JSON.stringify(TAX_BLOB, null, 2);
                        console.log(output);
                        //send to resilience.me-server.......


        }).request();//end of Ripple API account_tx request

                       


});//end of remote.connect()

                       


