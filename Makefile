# BUILD PWP FILES

build:
	browserify js/main.js -o static/podlove-web-player.js
	browserify js/moderator.js -o static/podlove-web-moderator.js
	compass compile
	autoprefixer static/*.css