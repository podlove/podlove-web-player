require('conventional-changelog')({
    from: "f36e96f9b1c2a8bdf90b2bf94346581f922d4c3c",
    repository: 'https://github.com/shakyShane/opt-merger',
    version: require('./package.json').version
}, function(err, log) {
    require("fs").writeFileSync("./CHANGELOG.md", log);
});