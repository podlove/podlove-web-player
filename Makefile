# BUILD PWP FILES

.PHONY: build
build: static/podlove-web-moderator.js
	browserify js/app.js -o static/podlove-web-player.js
	compass compile
	autoprefixer static/*.css


static/podlove-web-moderator.js: js/moderator.js
	browserify js/moderator.js -o static/podlove-web-moderator.js

.PHONY: clean
clean:
	-cd static; rm podlove-web-player.js podlove-web-moderator.js

