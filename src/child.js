var IPC = require('./IPC');

var c2p = new IPC.Write(process.argv[2], 'c2p');

c2p.send({ type: 'log', payload: 'testing!'});
c2p.send({ type: 'exit'});
