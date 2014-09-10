//================ Resilience.me-client v0.1 ================

//====== scans an accounts incoming transactions      =======
//====== for all currencies in wallet.currency        =======
//====== and declares tax for the latest transactions =======

//#CPLEIF



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

for (var j = 0; j < wallet.length; j++) { 
    IOUs = IOUs + wallet[j].currency + " ";
}


     
//================ define parameters for the Ripple API ================

     
      var params = {
        'account': "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ",
        'ledger_index_min': -1,
        'ledger_index_max': -1,
        'limit': 50
    };

//================ and some other variables ================
    
    
//note: the last transaction that the user connected to resilience.me
//is used to filter out all transactions that the user has recieved since

     var transaction_id_ping = "D5BAA90BCB77E2A3C66CD0F79A4A32079ABAF270B5C92369537EA1C1C204D7D1"; 
     
//the transaction_id_ping variable should be requested from the resilience.me-server
//I haven´t coded that yet.



     var taxRate;
     var tax_amount;

     var TAX_BLOB = [];
     var output = {};
     

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

//================ we loop through all the transctions
//================ and filter out the ones we want from the user


        for (var i=0; i < data.transactions.length; i++) {

                var tx = data.transactions[i].tx;
                
//================ control check
//the first service-requirement of resilience.me is that 
//the user needs to declare_tax for all the 
//currencies they have connected to our service.

//if the loop reaches the transaction_id of the last previous transaction that the user has connected
//then we have all the data we need, and the Ripple API loop stops.
                
        if (tx.hash === transaction_id_ping) { break }
        
//=============== /end of control check


//=============== we filter out account_tx data

            if (tx.TransactionType === 'Payment' && IOUs.indexOf(tx.Amount.currency) > -1 && tx.Destination === params.account) {


//================ we need to add data from the users Resilience.me-Wallet to the Ripple data
//================ we can use a loop to look up taxRate-values for each currency
//================ and add taxRate to every [i] transaction that is processed


             for (var k = 0; k < wallet.length; k++) { 
    
                 if (tx.Amount.currency === wallet[k].currency) {
                 taxRate = wallet[k].taxRate;
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


//================ all transactions that should be sent to resilience.me-server 
//================ are added to the TAX_BLOB that we declared at the top of the script

         TAX_BLOB.push(TAX_DATA);
                   
                    
                    
            }//end of if() filter-per-taxRate script
            
              
        }//end of var i loop
            
//======== we now have all the data we need in TAX_BLOB
//======== this data should be sent to the resilience.me-server

                              
                                    
           output = JSON.stringify(TAX_BLOB, null, 2);

//============send to resilience.me-server (script coming soon)
//the TAX_BLOB JSON output should be sent to the resilience.me server.
//I´ll code that soon. Now I just console.log it:
console.log(output);

           
   }).request();//end of Ripple API account_tx request


                       
                       
                       
});//end of remote.connect()
