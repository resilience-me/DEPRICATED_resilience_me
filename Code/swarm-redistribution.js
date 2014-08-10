{\rtf1\ansi\ansicpg1252\cocoartf1138\cocoasubrtf510
{\fonttbl\f0\fnil\fcharset0 Monaco;}
{\colortbl;\red255\green255\blue255;\red64\green116\blue71;\red255\green255\blue255;}
\paperw11900\paperh16840\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\sl300

\f0\fs24 \cf2 \cb3 \
var Remote = require('ripple-lib').Remote;\
\
// =======================================================\
\
var IOU = "RES";\
var START_ADDRESS = "r46XJq7UJmoPno2cURDRs8bB9crRLJgpcY";\
var LEDGER_INDEX = 'validated'; \
\
// ================= constants ===========================\
\
var remote = new Remote(\{\
\'a0 trusted:\'a0 \'a0 \'a0 \'a0 false,\
\'a0 local_signing:\'a0 true,\
\'a0 local_fee:\'a0 \'a0 \'a0 true,\
\'a0 fee_cushion:\'a0 \'a0 \'a01.5,\
\'a0 max_fee:\'a0 \'a0 \'a0 \'a0 \'a0 50,\
\'a0 max_listeners: 50,\
\'a0 servers: [\
\'a0 \'a0 \{\
\'a0 \'a0 \'a0 \'a0 host:\'a0 \'a0 's1.ripple.com'\
\'a0 \'a0 \'a0 , port:\'a0 \'a0 443\
\'a0 \'a0 \'a0 , secure:\'a0 true\
\'a0 \'a0 \}\
\'a0 ]\
\});\
\
\
var ACCOUNTS = [];\'a0 // hold all account that had been passed.\
\
var SWAMP = \{\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 account: START_ADDRESS,\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 balance: 0,\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 level: 0,\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 lines: \{\}\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \}\
\
// ================== functions =====================================\
\
function get_lines(swamp, callback) \{\
\
\'a0 var request = remote.request_account_lines(\{\
\'a0 \'a0 account: swamp.account,\
\'a0 \'a0 ledger: LEDGER_INDEX\
\'a0 \});\
\
\'a0 console.log('getting lines for', swamp.account, ' level:', swamp.level);\
\'a0 request.callback(function(err, res) \{\
\'a0 \'a0 if (err) \{console.log('err:',err); return;\}\
\
\'a0 \'a0 var lines = res.lines;\
\
\'a0 \'a0 // filtering with IOU symbol and negative balance.\
\'a0 \'a0 lines = lines.filter(function(element)\{ return (element.balance < 0 && element.currency === IOU); \});\
\
\'a0 \'a0 // if no more lines, mark [END]\
\'a0 \'a0 if (lines.length == 0) \{swamp.lines = "[END]"; if (typeof callback == 'function') \{callback()\}; return;\}\
\
\'a0 \'a0 lines.sort(function (a,b) \{ return parseFloat(b.balance) - parseFloat(a.balance) \} );\
\
\'a0 \'a0 for (i = lines.length - 1; i >= 0; i--) \{\
\'a0 \'a0 \'a0 \'a0 \'a0 var account = lines[i].account;\
\'a0 \'a0 \'a0 \'a0 \'a0 var balance = lines[i].balance\
\
\'a0 \'a0 \'a0 \'a0 \'a0 swamp.lines[account] = \{ \
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0account: account,\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0balance: balance,\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0level: swamp.level +1,\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0lines: \{\}\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \}\
\'a0 \'a0 \'a0 \'a0 \'a0 if (ACCOUNTS.indexOf(account) > -1) \{\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0// repeated account, mark as [circular] end.\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0swamp.lines[account].lines = "[CIRCULAR]";\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0lines.splice(i,1);\
\'a0 \'a0 \'a0 \'a0 \'a0 \} else \{\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0ACCOUNTS.push(account);\'a0 \'a0 \'a0 \
\'a0 \'a0 \'a0 \'a0 \'a0 \}\
\'a0 \'a0 \}\
\'a0 \'a0 \
\'a0 \'a0 // recursion to next-level.\
\'a0 \'a0 function next_node(i, callback) \{\
\'a0 \'a0 \'a0 var account = lines[i].account;\
\'a0 \'a0 \'a0 get_lines(swamp.lines[account], function () \{\'a0 \
\'a0 \'a0 \'a0 \'a0 \'a0 i--;\
\'a0 \'a0 \'a0 \'a0 \'a0 if (i >= 0 ) \{\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 next_node(i, callback);\
\'a0 \'a0 \'a0 \'a0 \'a0 \} else \{\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 if (typeof callback == 'function') \{callback()\};\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \
\'a0 \'a0 \'a0 \'a0 \'a0 \}\
\'a0 \'a0 \'a0 \})\'a0 \'a0 \'a0 \
\'a0 \'a0 \}\
\'a0 \'a0 if (lines.length > 0) \{ next_node(lines.length -1, callback); \} \
\'a0 \'a0 else if (typeof callback == 'function') \{callback()\};\
\
\'a0 \});\
\}\
\
remote.connect(function() \{\
\'a0 console.log('connected to Ripple-Network.');\'a0 \
\'a0 get_lines(SWAMP, print_swamp);\
\});\
\
function print_swamp () \{\
\'a0 \'a0 var output = JSON.stringify(SWAMP, null, 2);\
\'a0 \'a0 console.log(output);\
\}}