var IPC = require('./IPC');
var sleep = require('sleep');
var shell = require('..');

var WAIT_TIME = 0.01; // Seconds

var c2p = new IPC.Write(process.argv[2], 'c2p');
var p2c = new IPC.Read(process.argv[2], 'p2c');

process.on('uncaughtException', function(err) {
  c2p.send({ type: 'die', msg: err.message, stack: err.stack });
});

var events = [];

// This is in a function so that we can exit out of the while loop (to allow a callback to be called),
// Then come back into it.
function listenForEvents() {
  while (true) {
    // If we have to do a command, and suspend the while loop, this means that we'll get to all
    // events eventually.
    events = events.concat(p2c.events());
    // Just take the event off the begining, one by one. This mutates the array.
    for(var event; event = events.shift(); ) {
      switch (event.type) {
        case 'doCmd':
          event.args.push(function(code, stdout, stderr) {
            c2p.send({
                       type: 'cmdRet',
                       stdout: stdout,
                       stderr: stderr,
                       code: code,
                     });
            listenForEvents(); // Restart the wait loop
          });
          shell[event.cmd].apply(shell, event.args);
          return;
        case 'exit':
          process.exit();
          break;
        default:
        // noop
      }
    }
    sleep.usleep(WAIT_TIME * 1000000);
  }
}

listenForEvents(); // Start the wait loop


