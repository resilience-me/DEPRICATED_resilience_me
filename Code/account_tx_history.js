//lists an accounts incoming transactions
//for all currencies the account has connected
//and declares tax for each of transaction



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

    var params = {
        'account': "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ",
        'ledger_index_min': -1,
        'ledger_index_max': -1,
        'limit': 50
    };
    
    
//================ Create wallet ================
//should be encoded with ripple-account secret key
             
    var wallet = [
        {
        'currency':'RES',
        'taxRate': '0020000000'
        },
        
        {
        'currency':'USD',
        'taxRate': '0004000000'
        },
      
        {
        'currency':'EUR',
        'taxRate': '0010000000'
        },
   
    ];
    
    
   
   
//================ request account_tx ================

    

    remote.request_account_tx(params)
        .on('success', function(data) {


            for (var i=0; i < data.transactions.length; i++) {

                var tx = data.transactions[i].tx;



//================ wallet.currency ================


     var IOU1 = wallet[0].currency;
     var IOU2 = wallet[1].currency;
     var IOU3 = wallet[2].currency;
     var IOU = (IOU1 + ", "  +  IOU2 + ", " + IOU3);


             




//================ Incoming Payments ================

                if (tx.TransactionType === 'Payment' &&  IOU.indexOf(tx.Amount.currency) > -1 && tx.Destination === params.account) {
                    console.log("Incoming Payment");
                    console.log("Account=" + tx.Account);
                    console.log("Amount=" + tx.Amount.value);
                    console.log("Currency=" + tx.Amount.currency);
                    console.log("Issuer=" + tx.Amount.issuer);
                    console.log("Destination=" + tx.Destination);
                    //================ wallet.taxRate ================

                    if (tx.Amount.currency === IOU1) {
                       console.log("taxRate=" + wallet[0].taxRate) 
                    };

                    if (tx.Amount.currency === IOU2) {
                       console.log("taxRate=" + wallet[1].taxRate) 
                    };
            
                    if (tx.Amount.currency === IOU3) {
                       console.log("taxRate=" + wallet[2].taxRate) 
                    };
                        
            
                    console.log("");
                    console.log("===========");
                    console.log("");
                    
                    



                }
                
            }

        }).request();
});
