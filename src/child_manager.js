var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var os = require('os');
var common = require('./common');
var shell = require('..');
var sleep = require('sleep'); // TODO: Make this an optional dependency, and fallback to a wait loop
var IPC = require('./IPC');

var WAIT_TIME = 0.01; // Seconds

var inited = false;
var tmp, c2p, p2c, child;

function init() {
  if (inited) return; // Only do this once
  inited = true;

  tmp = path.resolve(os.tmpdir(), common.randomFileName());

  shell.rm('-rf', tmp);
  shell.mkdir('-p', tmp);

  child = spawn(process.execPath, [path.resolve(__dirname, 'child.js'), tmp], { stdio: 'inherit' });
  c2p = new IPC.Read(tmp, 'c2p');
  p2c = new IPC.Write(tmp, 'p2c');

  process.on('exit', function() {
    p2c.send({ type: 'exit' });
    shell.rm('-rf', tmp);
    tmp = c2p = p2c = child = null
  })
}

module.exports.doCmd = function doCmd(cmd, args) {
  init(); // Make sure we're ready

  p2c.send({ type: 'doCmd', cmd: cmd, args: args });
  var ret;
  mainLoop:
    while (true) {
      var events = c2p.events();
      for (var i = 0, len = events.length; i < len; ++i) {
        var event = events[i];
        switch (event.type) {
          case 'cmdRet':
            if (event.err) {
              throw event.err;
            }
            ret = new common.ShellString(event.stdout, event.stderr, event.code);
            break mainLoop;
          case 'die':
            break mainLoop;
          default:
            throw new Error('Unrecognized Event: ' + event.type);
        }
      }
      sleep.usleep(WAIT_TIME * 1000000);
    }
  return ret;
};

