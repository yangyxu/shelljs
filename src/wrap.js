var common;


// Wrap a command to do some args processing.
function wrap(fullname, func, optsMap, opts) {
    // To prevent a circular dependency
    common = common || require('./common');
    if (typeof fullname !== 'string') throw new TypeError('wrap: fullname must be a string!');
    if (typeof func !== 'function') throw new TypeError('wrap: func must be a function!');
    if (opts === undefined && optsMap && (optsMap.notUnix === true || optsMap.parseOptions === false)) {
      opts = optsMap;
      optsMap = false;
    }
    opts = opts || {};
    var unix = opts.unix === undefined ? true : opts.unix;
    var globIdx = opts.globIdx === undefined ? 1 : opts.globIdx;
    var shouldGlob = typeof globIdx === 'number' && globIdx > 0;
    var retShellString = opts.retShellString === undefined ? 1 : opts.retShellString;
    var parseOptions = opts.parseOptions === undefined ? typeof optsMap === 'object' && optsMap : opts.parseOptions;
    return function wrapped() {
        var args = [].slice.apply(arguments);
        var ret = null;
        common.state.currentCmd = fullname;
        common.state.error = null;
        common.state.errorCode = 0;

        try {
          if (common.config.verbose) console.error.apply(console, [cmd].concat(args));
          if (unix) {
            if (parseOptions && args.length === 0 || typeof args[0] !== 'string' || args[0].length <= 1 || args[0][0] !== '-') args.unshift(''); // add dummy option if needed

            // This is a simple version of flatten
            args = args.reduce(function(accum, cur) {
              return Array.isArray(cur) ? accum.concat(cur) : accum.concat([cur]);
            }, []);

            // TODO: We loop over the arguments multiple times. It might be faster to do it only once.
            // Convert ShellString to regular strings
            args = args.map(function(arg) {
              return (arg instanceof Object && arg.constructor.name === 'String') ? arg.toString() : arg;
            });

            // ~ Expansion
            if (shouldGlob) args = args.map(function(arg) {
              return (typeof arg === 'string' && (arg.slice(0, 2) === '~/' || arg === '~')) ? arg.replace(/^~/, common.getUserHome()) : arg;
            });

            // Globbing
            if (shouldGlob) args = args.slice(0, globIdx).concat(common.expand(args.slice(globIdx)));

            // parseOptions
            if (parseOptions) args[0] = common.parseOptions(args[0], optsMap);

            // Execute it
            try {
              ret = func.apply(this, args);
            } catch (e) { // Handle utils.error earlyExit
              if (e.msg === 'earlyExit') ret = e.retValue;
              else throw e;
            }

            // ShellStringify the output
            if (retShellString) ret = new common.ShellString(ret, common.state.error, common.state.errorCode);
          } else {
            return func.apply(this, args);
          }
        } catch (e) {
          if (!common.state.error) {
            // If state.error hasn't been set, then it's an error thrown by Node, not us - likely a bug.
            // TODO: I'm not sure if we should be swollowing the error here.
            console.error('shell.js: internal error');
            console.error(e.stack || e);
            process.exit(1);
          }
          if (common.config.fatal) throw e;
        }
        common.state.currentCmd = 'shell.js';
        return ret;
      } // wrapped
  } // wrap

module.exports = wrap;

