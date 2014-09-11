//============ resilience.me-server, swarm-redistribution =============

// september 11th, 2014

// example of how swarm-redistribution works. this example uses path-finding data from Ripple API.
// this is a path-finding algorithm that renders the network of people that a user is connected to
// a swarm, the cluster of people that are below a particular account in a hierarchy of transactions

// this script does most of what the swarm-redistribution algorithm should do, but I have not yet developed
// most of the resilience.me-server functionality, so it lacks a lot of the functions too.

// the resilience.me-server will handle all the data that the swarm-redistribution algorithm uses.
// a resilience.me-client v0.1 is already developed, and that client sends all the data that the algorithm needs.


// WHAT THIS SCRIPT DOES:

// looks at a ripple-account, and generates a list with all 
// accounts that are connected to that account through a hierarchical line of debt. 
// It creates a list of all accounts that have issued IOUs to that account, and does 
// the same for each of those down-stream accounts, and repeats that procedure until 
// it reaches the end of all lineages in that IOU.


var Remote = require('ripple-lib').Remote;

// =======================================================

var IOU = "XYZ"; // IOU that payed transaction tax
var START_ADDRESS = "rLaKjMvLbrAJwnH4VpawQ6ot9epZqJmbfQ"; //account that payed transaction tax
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

var SWARM = {
              account: START_ADDRESS,
              balance: 0,
              level: 0,
              lines: {}
            }

// ================== functions =====================================

function get_lines(swarm, callback) {

  var request = remote.request_account_lines({
    account: swarm.account,
    ledger: LEDGER_INDEX
  });

  console.log('getting lines for', swarm.account,' ', IOU, '  level:', swarm.level);
  request.callback(function(err, res) {
    if (err) {console.log('err:',err); return;}

    var lines = res.lines;

    // filtering with IOU symbol and negative balance.
    lines = lines.filter(function(element){ return (element.balance > 0 && element.currency === IOU); });

    // if no more lines, mark [END]
    if (lines.length == 0) {swarm.lines = "[END]"; if (typeof callback == 'function') {callback()}; return;}

    lines.sort(function (a,b) { return parseFloat(b.balance) - parseFloat(a.balance) } );

    for (i = lines.length - 1; i >= 0; i--) {
          var account = lines[i].account;
          var balance = lines[i].balance

          swarm.lines[account] = { 
                                   account: account,
                                   balance: balance,
                                   level: swarm.level +1,
                                   lines: {}
                                  }
          if (ACCOUNTS.indexOf(account) > -1) {
               // repeated account, mark as [circular] end.
               swarm.lines[account].lines = "[CIRCULAR]";
               lines.splice(i,1);
          } else {
               ACCOUNTS.push(account);      
          }
    }
    
    // recursion to next-level.
    function next_node(i, callback) {
      var account = lines[i].account;
      get_lines(swarm.lines[account], function () {  
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
  get_lines(SWARM, print_swarm);
});

function print_swarm () {
    var output = JSON.stringify(SWARM, null, 2);
    console.log(output);
}
