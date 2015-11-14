/*
 * Interaction demos for the <progress> polyfill
 * Demonstrates setting the progress value through Javascript
 * @author Espen Hovlandsdal http://rexxars.com
 */
(function(d) {
    var bind = function(el, event, fn) {
        if (el.addEventListener) {
            el.addEventListener(event, fn, false);
        } else {
            el.attachEvent('on' + event, fn)
        }
    };

    var dyn  = d.getElementById('dynamicProgress'), timer, progress = 0;
    var el   = dyn.getElementsByTagName('progress')[0];
    var perc = dyn.getElementsByClassName('percentage')[0];

    var progressTo = function(to) {
        clearInterval(timer);
        var inc = to < el.value ? -1 : 1;

        timer = setInterval(function() {
            progress += inc;
            el.value = progress;

            perc.innerHTML = progress;

            if (progress == to) {
                return clearInterval(timer);
            }
        }, 25);
    };

    bind(d.getElementById('animateFully'), 'click', function() {
        progressTo(100);
    });

    bind(d.getElementById('animateToUserInput'), 'click', function() {
        var to = parseInt(prompt('How many percent?', 50), 10);
        progressTo(Math.max(0, Math.min(100, to)));
    });

})(document);
