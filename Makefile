# BUILD PWP FILES

.PHONY: build
build:
	browserify js/app.js -o static/podlove-web-player.js
	browserify js/moderator.js -o static/podlove-web-moderator.js
	compass compile
	autoprefixer static/*.css

.PHONY: clean
clean:
	-cd static; rm podlove-web-player.js podlove-web-moderator.js

