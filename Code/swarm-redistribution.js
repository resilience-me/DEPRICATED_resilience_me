
var Remote = require('ripple-lib').Remote;

// =======================================================

var IOU = "RES";
var START_ADDRESS = "r46XJq7UJmoPno2cURDRs8bB9crRLJgpcY";
var LEDGER_INDEX = 'validated'; 

// ================= constants ===========================

var remote = new Remote({
  trusted:        false,
  local_signing:  true,
  local_fee:      true,
  fee_cushion:     1.5,
  max_fee:          50,
  max_listeners: 50,
  servers: [
    {
        host:    's1.ripple.com'
      , port:    443
      , secure:  true
    }
  ]
});


var ACCOUNTS = [];  // hold all account that had been passed.

var SWAMP = {
              account: START_ADDRESS,
              balance: 0,
              level: 0,
              lines: {}
            }

// ================== functions =====================================

function get_lines(swamp, callback) {

  var request = remote.request_account_lines({
    account: swamp.account,
    ledger: LEDGER_INDEX
  });

  console.log('getting lines for', swamp.account, ' level:', swamp.level);
  request.callback(function(err, res) {
    if (err) {console.log('err:',err); return;}

    var lines = res.lines;

    // filtering with IOU symbol and negative balance.
    lines = lines.filter(function(element){ return (element.balance < 0 && element.currency === IOU); });

    // if no more lines, mark [END]
    if (lines.length == 0) {swamp.lines = "[END]"; if (typeof callback == 'function') {callback()}; return;}

    lines.sort(function (a,b) { return parseFloat(b.balance) - parseFloat(a.balance) } );

    for (i = lines.length - 1; i >= 0; i--) {
          var account = lines[i].account;
          var balance = lines[i].balance

          swamp.lines[account] = { 
                                   account: account,
                                   balance: balance,
                                   level: swamp.level +1,
                                   lines: {}
                                  }
          if (ACCOUNTS.indexOf(account) > -1) {
               // repeated account, mark as [circular] end.
               swamp.lines[account].lines = "[CIRCULAR]";
               lines.splice(i,1);
          } else {
               ACCOUNTS.push(account);      
          }
    }
    
    // recursion to next-level.
    function next_node(i, callback) {
      var account = lines[i].account;
      get_lines(swamp.lines[account], function () {  
          i--;
          if (i >= 0 ) {
              next_node(i, callback);
          } else {
              if (typeof callback == 'function') {callback()};              
          }
      })      
    }
    if (lines.length > 0) { next_node(lines.length -1, callback); } 
    else if (typeof callback == 'function') {callback()};

  });
}

remote.connect(function() {
  console.log('connected to Ripple-Network.');  
  get_lines(SWAMP, print_swamp);
});

function print_swamp () {
    var output = JSON.stringify(SWAMP, null, 2);
    console.log(output);
}
