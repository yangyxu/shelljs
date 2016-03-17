//
//
//
///**
// * Make sure that there is a child running.
// */
//module.exports.init = function init() {
//
//};

var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var os = require('os');
var common = require('./common');
var shell = require('..');
var sleep = require('sleep');

var tmp = path.resolve(os.tmpdir(), common.randomFileName());

shell.rm('-rf', tmp);
shell.mkdir('-p', tmp);

var child = spawn(process.execPath, [path.resolve(__dirname, 'child.js'), tmp], { stdio: 'inherit' });

var linesRead = 0;
var done = false;
while (!fs.existsSync(path.resolve(tmp, 'c2p-0'))) sleep.usleep(0.01 * 1000000);
while (!done) {
  var lines = fs.readFileSync(path.resolve(tmp, 'c2p-0'), 'utf8').split('\n').slice(linesRead).filter(line => !!line);
  linesRead += lines.length;
  var events = lines.map(line => JSON.parse(line));
  events.forEach(event => {
    switch (event.type) {
      case 'log':
        console.log(event.payload);
        break;
      case 'exit':
        console.log('exiting...');
        done = true;
        break;
      default:
        throw new Error('Unrecognized Event: ' + event.type);
    }
  })
}
