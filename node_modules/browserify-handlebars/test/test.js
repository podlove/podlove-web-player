var exec = require('child_process').exec;

var child = exec('browserify -t ../index browserify-me.js | node', 
  function (err, stdout, stdin) {
    console.log(stdout);
});