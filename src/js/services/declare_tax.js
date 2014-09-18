/**
 * RESILIENCE.ME
 *
 * Declare Tax
 */


var module = angular.module('declare_tax', []);

module.factory('rpDeclareTax', ['$rootScope', 'rpNetwork', function ($scope, rpNetwork)
{
  
//=========== variables =============

    var params = {
    'account': "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ",
    'ledger_index_min': -1,
    'ledger_index_max': -1,
    'limit': 50
    };
    
    
    var IOUs = "";

    for (var j = 0; j < $scope.userBlob.data.resilience_me.length; j++) { 
        IOUs = IOUs + $scope.userBlob.data.resilience_me[j].currency + " ";
    }
    
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
  
//=========== declare_tax =============
  
    function declare_tax ()
    {
    
        rpNetwork.remote.request_account_tx(params)
            .on('success', function(data) {
            
            alert("downloading account_tx from Ripple API");

                for (var i=0; i < data.transactions.length; i++) {

                var tx = data.transactions[i].tx;

                if (tx.hash === transaction_id_ping) { break }
                
                
        
                if (tx.TransactionType === 'Payment' && IOUs.indexOf(tx.Amount.currency) > -1 && tx.Destination === params.account) {

                    for (var k = 0; k < $scope.userBlob.data.resilience_me.length; k++) { 
                       if (tx.Amount.currency === $scope.userBlob.data.resilience_me[k].currency) {
                       taxRate = $scope.userBlob.data.resilience_me[k].taxRate;
                       }
                    }    
                    

                    tax_amount = taxRate * tx.Amount.value;    
    
    
                    var TAX_DATA = {};
                    TAX_DATA.transaction_id = tx.hash;
                    TAX_DATA.account = tx.Account;
                    TAX_DATA.amount = tx.Amount.value;
                    TAX_DATA.currency = tx.Amount.currency;
                    TAX_DATA.issuer = tx.Amount.issuer;
                    TAX_DATA.destination = tx.Destination;
                    TAX_DATA.taxRate = taxRate;
                    TAX_DATA.tax_amount = tax_amount;
    
                    TAX_BLOB.push(TAX_DATA);
            
    
                    if (TOTAL_AMOUNT[TAX_DATA.currency] === undefined) {
                     TOTAL_AMOUNT[TAX_DATA.currency] = Number(TAX_DATA.amount);
                       
                    }
                    else {
                    TOTAL_AMOUNT[TAX_DATA.currency] += Number(TAX_DATA.amount);
                    }


                    
                }//end of if() filter-per-taxRate script


                }//end for (var i)
                
                
                            
//======== we now have all the data we need in TAX_BLOB
//======== this data should be sent to the resilience.me-server
                                    
           output = JSON.stringify(TAX_BLOB, null, 2);
            console.log(output);




        }).request();//end of Ripple API account_tx request
    
    }

  

  return declare_tax;
}]);
