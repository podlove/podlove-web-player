var bs     = require("browser-sync").create();
var client = require("./");

client["plugin:name"] = "client:script";

bs.use(client);

bs.init({
    //server: ["/Users/shakyshane/sites/oss/web-starter-kit/app", "/Users/shakyshane/sites/oss/web-starter-kit/.tmp"],
    server: ["test/fixtures"],
    files: ["test/fixtures"],
    minify: false,
    //scrollElements: [".test"],
    scrollElementMapping: [".test"],
    open: false
});

