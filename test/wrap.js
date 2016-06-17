var shell = require('..');
var common = require('../src/common');
var wrap = require('../src/wrap');
var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var wrapped, ret;

//
// Invalids
//
assert.throws(function() {
  wrap();
});

assert.throws(function() {
  wrap(5, 'foobar');
});

//
// Valids
//

shell.touch('tmp/foo.txt', 'tmp/bar.txt', 'tmp/baz.txt', 'tmp/qux.txt');

// unix = false
wrap('test', function (notOption) { // don't parse options.
  assert.equal(notOption, '-foobar');
}, { unix: false })('-foobar');

wrap('test', function (notOption, arg1) { // don't flatten args
  assert.ok(Array.isArray(arg1));
  assert.equal(arguments.length, 2);
}, false, { unix: false })('-foobar', ['a', 'b', 'c']);

wrap('test', function (notOption, stillAShellString) { // Don't auto-convert ShellStrings
  assert.ok(stillAShellString instanceof Object);
  assert.equal(stillAShellString.constructor.name, 'String');
  assert.equal(stillAShellString.toString(), 'foobarbaz');
}, false, { unix: false })('-foobar', new common.ShellString('foobarbaz'));

wrap('test', function (notOption, notHome, notAGlob) { // No globbing
  assert.equal(notHome, '~');
  assert.equal(notAGlob, 'tmp/*');
  assert.equal(arguments.length, 3);
}, false, { unix: false })('-foobar', '~', 'tmp/*');

ret = wrap('test', function () {
  return 'foo';
}, false, { unix: false })();

assert.ok(typeof ret === 'string'); // No ShellString conversion

// parseOptions
wrap('test', function (opts) { // It works!
  assert.ok(opts.aaa);
  assert.ok(!opts.bbb);
  assert.ok(opts.ccc);
  assert.ok(!opts.ddd);
}, { a: 'aaa', b: 'bbb', c: '!ccc', d: '!ddd' })('-ad');

wrap('test', function (opts) { // Disabling it #1
  assert.equal(opts, '-foobar');
}, null, {})('-foobar');

wrap('test', function (opts) { // Disabling It #2
  assert.equal(opts, '-foobar');
}, { f: 'f', o: 'o', b: 'b', a: 'a', r: 'r' }, { parseOptions: false })('-foobar');

wrap('test', function (opts) { // When no opts are passed
  assert.ok(!opts.a);
  assert.ok(opts.b);
}, { a: 'a', b: '!b' })();

// Globbing
wrap('test', function (opts, file1) { // Basics
  assert.equal(arguments.length, 5);
  assert.deepEqual([].slice.apply(arguments).slice(1).sort(), ['tmp/foo.txt', 'tmp/bar.txt', 'tmp/baz.txt', 'tmp/qux.txt'].sort());
})('tmp/*.txt');

wrap('test', function (opts) { // Different globIdx
  assert.equal(arguments.length, 6);
  assert.equal(arguments[1], 'tmp/*.txt');
  assert.deepEqual([].slice.apply(arguments).slice(2).sort(), ['tmp/foo.txt', 'tmp/bar.txt', 'tmp/baz.txt', 'tmp/qux.txt'].sort());
}, {}, { globIdx: 2 })('tmp/*.txt', 'tmp/*.txt');

wrap('test', function (opts, homedir) { // ~ expansion
  assert.equal(arguments.length, 2);
  assert.equal(homedir, common.getUserHome());
}, {})('~');

// retShellString
ret = wrap('test', function () {
  return 'foobar';
}, {})();
assert.ok(ret instanceof Object);
assert.equal(ret.stdout, 'foobar');
assert.equal(ret.constructor.name, 'String');
assert.equal(ret.stderr, null);
assert.equal(ret.code, 0);

ret = wrap('test', function () {
  return 'foobar';
}, {}, { retShellString: false })();
assert.equal(typeof ret, 'string');


shell.exit(123);
