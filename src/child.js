var fs = require('fs');
var path = require('path');

var fd = fs.openSync(path.resolve(process.argv[2], 'c2p-0'), 'ax');

function sendMessage(type, payload) {
  fs.writeSync(fd, JSON.stringify({ type: type, payload: payload }) + '\n');
}

sendMessage('log', 'testing!');
sendMessage('exit');
