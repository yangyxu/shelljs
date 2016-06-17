//
// ShellJS
// Unix shell commands on top of Node's API
//
// Copyright (c) 2012 Artur Adib
// http://github.com/arturadib/shelljs
//

var wrap = require('./src/wrap');
var common = require('./src/common.js');

//@
//@ All commands run synchronously, unless otherwise stated.
//@ All commands accept standard bash globbing characters (`*`, `?`, etc.),
//@ compatible with the [node glob module](https://github.com/isaacs/node-glob).
//@
//@ For less-commonly used commands and features, please check out our [wiki
//@ page](https://github.com/shelljs/shelljs/wiki).
//@

// Boilerplate
// -----------
// Copy the code block below here & replace variables with appropiate values
// ```
// //@include ./src/fileName
// var functionName = require('./src/fileName');
// exports.nameOfCommand = wrap(nameOfCommand, functionName [, {Globidx: firstIndexToExpand} = 1]);
// ```
//
// The //@include includes the docs for that command
//
// firstIndexToExpand defaults to 1, and the options object doesn't need to be included if that's an OK value.
// Increase this value if the command takes arguments that shouldn't be expanded
// with wildcards, such as with the regexes for sed & grep

//@include ./src/cd
var _cd = require('./src/cd');
exports.cd = wrap('cd', _cd);

//@include ./src/pwd
var _pwd = require('./src/pwd');
exports.pwd = wrap('pwd', _pwd);

//@include ./src/ls
var _ls = require('./src/ls');
exports.ls = wrap('ls', _ls);

//@include ./src/find
var _find = require('./src/find');
exports.find = wrap('find', _find);

//@include ./src/cp
var _cp = require('./src/cp');
exports.cp = wrap('cp', _cp);

//@include ./src/rm
var _rm = require('./src/rm');
exports.rm = wrap('rm', _rm);

//@include ./src/mv
var _mv = require('./src/mv');
exports.mv = wrap('mv', _mv);

//@include ./src/mkdir
var _mkdir = require('./src/mkdir');
exports.mkdir = wrap('mkdir', _mkdir);

//@include ./src/test
var _test = require('./src/test');
exports.test = wrap('test', _test);

//@include ./src/cat
var _cat = require('./src/cat');
exports.cat = wrap('cat', _cat);

//@include ./src/head
var _head = require('./src/head');
exports.head = wrap('head', _head);

//@include ./src/tail
var _tail = require('./src/tail');
exports.tail = wrap('tail', _tail);

// The below commands have been moved to common.ShellString(), and are only here
// for generating the docs
//@include ./src/to
//@include ./src/toEnd

//@include ./src/sed
var _sed = require('./src/sed');
exports.sed = wrap('sed', _sed, { globIdx: 3 }); // don't glob-expand regexes

//@include ./src/sort
var _sort = require('./src/sort');
exports.sort = wrap('sort', _sort);

//@include ./src/grep
var _grep = require('./src/grep');
exports.grep = wrap('grep', _grep, { globIdx: 2 }); // don't glob-expand the regex

//@include ./src/which
var _which = require('./src/which');
exports.which = wrap('which', _which);

//@include ./src/echo
var _echo = require('./src/echo');
exports.echo = wrap('echo', _echo);

//@include ./src/dirs
var _dirs = require('./src/dirs').dirs;
exports.dirs = wrap('dirs', _dirs);
var _pushd = require('./src/dirs').pushd;
exports.pushd = wrap('pushd', _pushd);
var _popd = require('./src/dirs').popd;
exports.popd = wrap('popd', _popd);

//@include ./src/ln
var _ln = require('./src/ln');
exports.ln = wrap('ln', _ln);

//@
//@ ### exit(code)
//@ Exits the current process with the given exit code.
exports.exit = process.exit;

//@
//@ ### env['VAR_NAME']
//@ Object containing environment variables (both getter and setter). Shortcut to process.env.
exports.env = process.env;

//@include ./src/exec
var _exec = require('./src/exec');
exports.exec = wrap('exec', _exec, {}, { unix: false });

//@include ./src/chmod
var _chmod = require('./src/chmod');
exports.chmod = wrap('chmod', _chmod);

//@include ./src/touch
var _touch = require('./src/touch');
exports.touch = wrap('touch', _touch);

//@include ./src/set
var _set = require('./src/set');
exports.set = wrap('set', _set);


//@
//@ ## Non-Unix commands
//@

//@include ./src/tempdir
var _tempDir = require('./src/tempdir');
exports.tempdir = wrap('tempdir', _tempDir);

//@include ./src/error
var _error = require('./src/error');
exports.error = _error;

//@include ./src/common
exports.ShellString = common.ShellString;

//@
//@ ### Pipes
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('foo', 'file1.txt', 'file2.txt').sed(/o/g, 'a').to('output.txt');
//@ echo('files with o\'s in the name:\n' + ls().grep('o'));
//@ cat('test.js').exec('node'); // pipe to exec() call
//@ ```
//@
//@ Commands can send their output to another command in a pipe-like fashion.
//@ `sed`, `grep`, `cat`, `exec`, `to`, and `toEnd` can appear on the right-hand
//@ side of a pipe. Pipes can be chained.

//@
//@ ## Configuration
//@

exports.config = common.config;

//@
//@ ### config.silent
//@
//@ Example:
//@
//@ ```javascript
//@ var sh = require('shelljs');
//@ var silentState = sh.config.silent; // save old silent state
//@ sh.config.silent = true;
//@ /* ... */
//@ sh.config.silent = silentState; // restore old silent state
//@ ```
//@
//@ Suppresses all command output if `true`, except for `echo()` calls.
//@ Default is `false`.

//@
//@ ### config.fatal
//@
//@ Example:
//@
//@ ```javascript
//@ require('shelljs/global');
//@ config.fatal = true; // or set('-e');
//@ cp('this_file_does_not_exist', '/dev/null'); // throws Error here
//@ /* more commands... */
//@ ```
//@
//@ If `true` the script will throw a Javascript error when any shell.js
//@ command encounters an error. Default is `false`. This is analogous to
//@ Bash's `set -e`

//@
//@ ### config.verbose
//@
//@ Example:
//@
//@ ```javascript
//@ config.verbose = true; // or set('-v');
//@ cd('dir/');
//@ ls('subdir/');
//@ ```
//@
//@ Will print each command as follows:
//@
//@ ```
//@ cd dir/
//@ ls subdir/
//@ ```

//@
//@ ### config.globOptions
//@
//@ Example:
//@
//@ ```javascript
//@ config.globOptions = {nodir: true};
//@ ```
//@
//@ Use this value for calls to `glob.sync()` instead of the default options.
