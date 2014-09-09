//lists an accounts incoming transactions
//for all currencies the account has connected
//and declares tax for each of transaction
//slacker-code, mostly to get a working prototype



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
    
    
     //this holds the transaction data that should be connected with resilience.me
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
   
//================ request account_tx ================

    

    remote.request_account_tx(params)
        .on('success', function(data) {


                    //limit how many transactions to declare_tax for

                    var r=0;
                    
                    

            for (var i=0; i < data.transactions.length; i++) {

                var tx = data.transactions[i].tx;



//================ wallet.currency ================


     var IOU1 = wallet[0].currency;
     var IOU2 = wallet[1].currency;
     var IOU3 = wallet[2].currency;
     var IOU = (IOU1 + ", "  +  IOU2 + ", " + IOU3);


             
   


//================ Incoming Payments ================

                if (tx.TransactionType === 'Payment' &&  IOU.indexOf(tx.Amount.currency) > -1 && tx.Destination === params.account) {
                    

                    
//================ wallet.taxRate ================
                    //declare variables
                    var taxRate;
                    var tax_amount;

                    //filter by currency
                    if (tx.Amount.currency === IOU1) {
                        taxRate = wallet[0].taxRate;
                    }

                    if (tx.Amount.currency === IOU2) {
                        taxRate = wallet[1].taxRate;
                    }
            
                    if (tx.Amount.currency === IOU3) {
                        taxRate = wallet[2].taxRate;
                    }
                    
                    //calculate tax_amount
                       taxRate = parseInt(taxRate, 10) * 0.000000001;
                       tax_amount = taxRate * tx.Amount.value;

                    //================ declare_tax ================
                    
                    //Like anyone can issue IOUs in Ripple, resilience.me lets anyone 
                    //connect IOUs of any currency to our system.
                    //resilience.me generates a list of outgoing payments, sign the 
                    //list of outgoing payments, IF <= (amount * taxRate)
                    
                    //connect incoming payments with the resilience network
                    //(example, haven´t coded yet)
                    

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
                    
                    
                    if (r <= 4) {
                        //send to resilience.me
                        //these declare_tax objects are sent to resilience.me
                        //not finished need resilience.me server and resilience.me-lib
                        var output = JSON.stringify(TAX_BLOB, null, 2);
                        console.log(output);
                        console.log("command: declare_tax");
                        console.log("connecting to resilience.me...");
                        console.log("sending data...");                    
                        console.log("COMPLETE");


                    }
                    
                    r++;


                    
                    



                }
                
            }

        }).request();
        
       
        


        
});


