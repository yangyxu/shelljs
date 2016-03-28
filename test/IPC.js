var shell = require('..');
var IPC = require('../src/IPC');
var os = require('os');
var path = require('path');
var fs = require('fs');
var common = require('../src/common');
var assert = require('assert');

var tmps = []; // We want to be able to clean up later.

function getTmp() {
  var tmp = path.resolve(os.tmpdir(), common.randomFileName());
  shell.rm('-rf', tmp);
  shell.mkdir('-p', tmp);

  tmps.push(tmp);

  return tmp;
}

// Make sure we clean up after ourselves.
process.on('exit', function() {
  tmps.map(function(tmp) {
    shell.rm('-rf', tmp);
  });
});

// IPC.Read
var read;

// Invalids
read = new IPC.Read(getTmp(), 'i01');
fs.writeFileSync(read.file, 'INVALID JSON!!!!\n');
assert.throws(function() {
  read.events();
});

read = new IPC.Read(getTmp(), 'i02');
fs.writeFileSync(read.file, '{"valid": "JSON"}\nINVALID JSON!!!!\n{"valid":"JSON2"}\n');
assert.throws(function() {
  read.events();
});

read = new IPC.Read(getTmp(), 'i03');
fs.writeFileSync(read.file, new Buffer([0x00, 0x00, 0x01, 0x02, 0x00, 0x0A]));
assert.throws(function() {
  read.events();
});

// Valids

// Single Objects
read = new IPC.Read(getTmp(), 'v01');
fs.writeFileSync(read.file, '{"valid": "object"}\n');
assert.deepEqual(read.events(), [{ valid: 'object' }]);

read = new IPC.Read(getTmp(), 'v02');
fs.writeFileSync(read.file, '["valid", "array"]\n');
assert.deepEqual(read.events(), [['valid', 'array']]);

read = new IPC.Read(getTmp(), 'v03');
fs.writeFileSync(read.file, '"valid string"\n');
assert.deepEqual(read.events(), ["valid string"]);

read = new IPC.Read(getTmp(), 'v04');
fs.writeFileSync(read.file, '5\n');
assert.deepEqual(read.events(), [5]);

// Multiple Objects
read = new IPC.Read(getTmp(), 'v05');
fs.writeFileSync(
  read.file,
  '{"valid": "object"}\n["valid", "array"]\n"valid string"\n{"valid": "object"}\n5\n'
);
assert.deepEqual(
  read.events(),
  [{ valid: 'object' }, ['valid', 'array'], "valid string", { valid: 'object' }, 5]
);

// Sent in chunks
read = new IPC.Read(getTmp(), 'v05');
fs.appendFileSync(read.file, '{"valid": "object"}\n["valid", "array"]\n');
assert.deepEqual(read.events(), [{ valid: 'object' }, ['valid', 'array']]);
fs.appendFileSync(read.file, '"valid string"\n{"va');
assert.deepEqual(read.events(), ['valid string']);
fs.appendFileSync(read.file, 'lid": "obj');
assert.deepEqual(read.events(), []);
fs.appendFileSync(read.file, 'ect"}\n5');
assert.deepEqual(read.events(), [{ valid: 'object' }, 5]);
fs.appendFileSync(read.file, '\n');

shell.exit(123);
