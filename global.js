var shell = require('./shell.js');
var wrap = require('./src/wrap.js');
for (var cmd in shell)
  global[cmd] = shell[cmd];

var _to = require('./src/to');
String.prototype.to = wrap('to', _to);

var _toEnd = require('./src/toEnd');
String.prototype.toEnd = wrap('toEnd', _toEnd);
