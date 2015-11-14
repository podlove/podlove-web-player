"use strict";
var events  = require("./events");
var utils   = require("./browser.utils");
var emitter = require("./emitter");
var sync    = exports;

var options = {

    tagNames: {
        "css":  "link",
        "jpg":  "img",
        "jpeg": "img",
        "png":  "img",
        "svg":  "img",
        "gif":  "img",
        "js":   "script"
    },
    attrs: {
        "link":   "href",
        "img":    "src",
        "script": "src"
    }
};

var hiddenElem;
var OPT_PATH = "codeSync";

var current = function () {
    return window.location.pathname;
};

/**
 * @param {BrowserSync} bs
 */
sync.init = function (bs) {

    if (bs.options.tagNames) {
        options.tagNames = bs.options.tagNames;
    }

    if (bs.options.scrollRestoreTechnique === "window.name") {
        sync.saveScrollInName(bs);
    } else {
        sync.saveScrollInCookie(utils.getWindow(), utils.getDocument());
    }

    bs.socket.on("file:reload", sync.reload(bs));
    bs.socket.on("browser:reload", function () {
        if (bs.canSync({url: current()}, OPT_PATH)) {
            sync.reloadBrowser(true, bs);
        }
    });
};

/**
 * Use window.name to store/restore scroll position
 */
sync.saveScrollInName = function () {

    var $window = utils.getWindow();
    var saved   = {};

    /**
     * Register the save event for whenever we call
     * a hard reload
     */
    emitter.on("browser:hardReload", function () {
        $window.name = $window.name + "bs=" + JSON.stringify({
            bs: {
                hardReload: true,
                scroll:     utils.getBrowserScrollPosition()
            }
        });
    });

    /**
     * window.name is always a string, even when never set.
     */
    try {
        var json = $window.name.match(/bs=(.+)$/);
        if (json) {
            saved = JSON.parse(json[1]);
        }
    } catch (e) {
        saved = {};
    }

    /**
     * if the JSON was parsed correctly, try to
     * find a scroll property and restore it.
     */
    if (saved.bs && saved.bs.hardReload && saved.bs.scroll) {
        utils.setScroll(saved.bs.scroll);
    }

    $window.name = "";
};

/**
 * Use a cookie-drop to save scroll position of
 * @param $window
 * @param $document
 */
sync.saveScrollInCookie = function ($window, $document) {

    if (!utils.isOldIe()) {
        return;
    }

    if ($document.readyState === "complete") {
        utils.restoreScrollPosition();
    } else {
        events.manager.addEvent($document, "readystatechange", function() {
            if ($document.readyState === "complete") {
                utils.restoreScrollPosition();
            }
        });
    }

    emitter.on("browser:hardReload", utils.saveScrollPosition);
};

/**
 * @param elem
 * @param attr
 * @param options
 * @returns {{elem: HTMLElement, timeStamp: number}}
 */
sync.swapFile = function (elem, attr, options) {

    var currentValue = elem[attr];
    var timeStamp = new Date().getTime();
    var suffix = "?rel=" + timeStamp;

    var justUrl = sync.getFilenameOnly(currentValue);

    if (justUrl) {
        currentValue = justUrl[0];
    }

    if (options) {
        if (!options.timestamps) {
            suffix = "";
        }
    }

    elem[attr] = currentValue + suffix;

    var body = document.body;

    setTimeout(function () {
        if (!hiddenElem) {
            hiddenElem = document.createElement("DIV");
            body.appendChild(hiddenElem);
        } else {
            hiddenElem.style.display = "none";
            hiddenElem.style.display = "block";
        }
    }, 200);

    return {
        elem: elem,
        timeStamp: timeStamp
    };
};

sync.getFilenameOnly = function (url) {
    return /^[^\?]+(?=\?)/.exec(url);
};

/**
 * @param {BrowserSync} bs
 * @returns {*}
 */
sync.reload = function (bs) {

    /**
     * @param data - from socket
     */
    return function (data) {

        if (!bs.canSync({url: current()}, OPT_PATH)) {
            return;
        }
        var transformedElem;
        var options    = bs.options;
        var emitter = bs.emitter;

        if (data.url || !options.injectChanges) {
            sync.reloadBrowser(true);
        }

        if (data.basename && data.ext) {

            var domData = sync.getElems(data.ext);
            var elems   = sync.getMatches(domData.elems, data.basename, domData.attr);

            if (elems.length && options.notify) {
                emitter.emit("notify", {message: "Injected: " + data.basename});
            }

            for (var i = 0, n = elems.length; i < n; i += 1) {
                transformedElem = sync.swapFile(elems[i], domData.attr, options);
            }
        }

        return transformedElem;
    };
};

/**
 * @param fileExtension
 * @returns {*}
 */
sync.getTagName = function (fileExtension) {
    return options.tagNames[fileExtension];
};

/**
 * @param tagName
 * @returns {*}
 */
sync.getAttr = function (tagName) {
    return options.attrs[tagName];
};

/**
 * @param elems
 * @param url
 * @param attr
 * @returns {Array}
 */
sync.getMatches = function (elems, url, attr) {

    if (url[0] === "*") {
        return elems;
    }

    var matches = [];

    for (var i = 0, len = elems.length; i < len; i += 1) {
        if (elems[i][attr].indexOf(url) !== -1) {
            matches.push(elems[i]);
        }
    }

    return matches;
};

/**
 * @param fileExtension
 * @returns {{elems: NodeList, attr: *}}
 */
sync.getElems = function(fileExtension) {

    var tagName = sync.getTagName(fileExtension);
    var attr    = sync.getAttr(tagName);

    return {
        elems: document.getElementsByTagName(tagName),
        attr: attr
    };
};

/**
 * @param confirm
 */
sync.reloadBrowser = function (confirm) {
    emitter.emit("browser:hardReload");
    if (confirm) {
        utils.reloadBrowser();
    }
};