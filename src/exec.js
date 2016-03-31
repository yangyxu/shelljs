var common = require('./common');
var _tempDir = require('./tempdir');
var _pwd = require('./pwd');
var path = require('path');
var fs = require('fs');
var child = require('child_process');

var DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024;

// Wrapper around exec() to enable echoing output to console in real time
function execAsync(cmd, opts, pipe, callback) {
  var stdout = '';
  var stderr = '';

  opts = common.extend({
                         silent: common.config.silent,
                         cwd: _pwd().toString(),
                         env: process.env,
                         maxBuffer: DEFAULT_MAXBUFFER_SIZE
                       }, opts);

  var c = child.exec(cmd, opts, function(err) {
    callback(err ? err.code : 0, stdout, stderr);
  });

  if (pipe) {
    c.stdin.end(pipe);
  }

  c.stdout.on('data', function(data) {
    stdout += data;
    if (!opts.silent) {
      process.stdout.write(data);
    }
  });

  c.stderr.on('data', function(data) {
    stderr += data;
    if (!opts.silent) {
      process.stderr.write(data);
    }
  });

  return c;
}

//@
//@ ### exec(command [, options] [, callback])
//@ Available options (all `false` by default):
//@
//@ + `async`: Asynchronous execution. If a callback is provided, it will be set to
//@   `true`, regardless of the passed value.
//@ + `silent`: Do not echo program output to console.
//@ + and any option available to NodeJS's
//@
// [child_process.exec()](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
// @ @ Examples: @ @ ```javascript @ var version = exec('node --version', {silent:true}).stdout; @
// @ var child = exec('some_long_running_process', {async:true}); @ child.stdout.on('data',
// function(data) { @   /* ... do something with data ... */ @ }); @ @
// exec('some_long_running_process', function(code, stdout, stderr) { @   console.log('Exit code:',
// code); @   console.log('Program output:', stdout); @   console.log('Program stderr:', stderr); @
// }); @ ``` @ @ Executes the given `command` _synchronously_, unless otherwise specified.  When in
// synchronous @ mode returns the object `{ code:..., stdout:... , stderr:... }`, containing the
// program's @ `stdout`, `stderr`, and its exit `code`. Otherwise returns the child process object,
// @ and the `callback` gets the arguments `(code, stdout, stderr)`. @ @ **Note:** For long-lived processes, it's best to run `exec()` asynchronously as @ the current synchronous implementation uses a lot of CPU. This should be getting @ fixed soon.
function _exec(command, options, callback) {
  if (!command) {
    common.error('must specify command');
  }

  var pipe = common.readFromPipe(this);

  // Callback is defined instead of options.
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = common.extend({ silent: common.config.silent }, options);

  try {
    return execAsync(command, options, pipe, callback);
  } catch (e) {
    common.error('internal error');
  }
}
module.exports = _exec;
