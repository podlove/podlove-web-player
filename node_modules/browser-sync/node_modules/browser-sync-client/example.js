var bs     = require("browser-sync").create();
var client = require("./");

client["plugin:name"] = "client:script";

bs.use(client);

bs.init({
    server: {
        baseDir: ["test/fixtures"]
    },
    open: false,
    //minify: false
    //snippetOptions: {
    //    rule: {
    //        match: /SHNAE/,
    //        fn: function (snippet) {
    //            return snippet + "\n</body>";
    //        }
    //    }
    //}
});

