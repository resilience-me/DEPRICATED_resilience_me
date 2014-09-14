//cloud9: list of global variables:
/*global data params*/

//================ declare_tax_filter ================

//filter for the request_account_tx function

//export to the resilience_me service, resilience_me.js
module.exports = {
declare_tax_filter: declare_tax_filter
};



//================ Create wallet ================
//the wallet should be it´s own file, but haven´t coded that yet.
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
        }

    ];
    
//================ create a string with wallet.currency ================
//this is used to filter taxation data by the currencies that the user wants to tax

     var IOUs = "";

for (var j = 0; j < wallet.length; j++) { 
    IOUs = IOUs + wallet[j].currency + " ";
}


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
     var TOTAL_AMOUNT = [];
     var IOU;


//================ now we filter data from the Ripple API.                       
//================ we want to scan all the transactions we requested from Ripple
//================ and filter out incoming transactions in 
//================ the currencies that the user wants to tax

//================ we loop through all the transctions
//================ and filter out the ones we want from the user


    function declare_tax_filter () {

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
        
//================ we also sum up TOTAL_AMOUNT per currency (for use in script below)

if (TOTAL_AMOUNT[TAX_DATA.currency] === undefined) {
 TOTAL_AMOUNT[TAX_DATA.currency] = Number(TAX_DATA.amount);
   
}
else {
TOTAL_AMOUNT[TAX_DATA.currency] += Number(TAX_DATA.amount);
}


                    
            }//end of if() filter-per-taxRate script
            
        }//end of var i loop
            
//======== we now have all the data we need in TAX_BLOB
//======== this data should be sent to the resilience.me-server
                                    
           output = JSON.stringify(TAX_BLOB, null, 2);





//============send to resilience.me-server (script coming soon)
//the TAX_BLOB JSON output should be sent to the resilience.me server.
//I´ll code that soon. Now I just console.log it:

    console.log(TAX_BLOB);



//============ swarm-redistribution (script coming soon)

//the resilience.me-server returns unsigned lists of payments
//one list for each currency that was declared
//and the script signs them if they don´t exceed total amount taxed * tax_rate


//I haven´t coded this yet. I have some example-code below, to get you going.
//for some reason, TOTAL_AMOUNT.IOU doesn´t work, but TOTAL_AMOUNT.RES does, and IOU[0] = RES 
    
     for (var d = 0; d < wallet.length; d++) { 
   
         var IOU = wallet[d].currency;
         console.log(TOTAL_AMOUNT.IOU * wallet[d].taxRate);
          alert(IOU);

     }   
 
 
 
    }
 

        
