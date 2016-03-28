var fs = require('fs');
var path = require('path');

function Read(tmp, name) {
  if (!(this instanceof Read)) return new Read(tmp, name);
  this.tmp = tmp;
  this.name = name;
  this.file = path.resolve(tmp, name + '-0');
  this.unparsedStr = ''; // In case there is a partly written line.

  if (!fs.existsSync(this.file)) {
    fs.writeFileSync(this.file, '');
  }

  this.fd = fs.openSync(this.file, 'r'); // Maybe this should be 'rs'
}

Read.prototype.events = function() {
  var str = this.unparsedStr || '';
  while (true) {
    var buf = new Buffer(100);
    var bytesRead = fs.readSync(this.fd, buf, 0, buf.length);

    if (bytesRead === 0) break;

    buf = buf.slice(0, bytesRead);
    str += buf.toString('utf8');
  }

  var lines = str.split('\n');
  this.unparsedStr = lines.pop() || '';

  return lines.map(JSON.parse);
};

function Write(tmp, name) {
  if (!(this instanceof Write)) return new Write(tmp, name);
  this.tmp = tmp;
  this.name = name;
  this.file = path.resolve(tmp, name + '-0');
  this.fd = fs.openSync(this.file, 'a');
}

Write.prototype.send = function(json) {
  fs.writeSync(this.fd, JSON.stringify(json) + '\n', 'utf8');
};

module.exports.Read = Read;
module.exports.Write = Write;
