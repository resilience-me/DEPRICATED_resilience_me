//cloud9: list of global variables:
/*global angular*/

var declare_tax_filter = require('./declare_tax.js');  


//params for the ripple API:

var params = {
        'account': "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ",
        'ledger_index_min': -1,
        'ledger_index_max': -1,
        'limit': 50
    };
  
  
//export declare_tax() to send.js
    
module.exports = {
declare_tax: declare_tax
};



//the module below, declare_tax(), 
//is excecuted when a user signs a transactions:

function declare_tax() {
    
        //connect network.js Ripple API service:
        
        var injector = angular.injector(['network', 'ng']);
    
        var network = injector.get('rpNetwork');
        alert(String(network));
            alert("connected to network.js remote !!");
            
            
            network.remote.request_account_tx(params)
                .on('success', function(data) {
                alert("connected to Ripple API !!");
                });
                
        }

    



