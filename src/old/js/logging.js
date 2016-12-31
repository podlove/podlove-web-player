var loglevel = require('loglevel');
var originalFactory = loglevel.methodFactory;

// extend loglevel here
function logWithLoggerName(methodName, logLevel, loggerName) {
  var rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function () {
    var args = [loggerName];
    for (var l = arguments.length, i = 0; i < l; i++) {
      args.push(arguments[i]);
    }
    rawMethod.apply(loglevel, args);
  };
}

// loglevel.methodFactory = logWithLoggerName;

// set the global log level here
loglevel.setLevel(loglevel.levels.INFO);

module.exports = loglevel;
