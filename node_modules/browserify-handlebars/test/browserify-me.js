var testTemplate = require('./templates/test.hbs');
var testTemplate2 = require('./templates/test2.hbs');

console.log(testTemplate({title: "Hello World", name: "David"}));
console.log(testTemplate2({name: "Tully"}));