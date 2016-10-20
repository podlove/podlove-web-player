MEJS_DIR   = ./podlove-web-player/libs/mediaelement
STATIC_DIR = ./podlove-web-player/static
postcss    = ./node_modules/.bin/postcss
uglifycss  = ./node_modules/.bin/uglifycss
uglifyjs   = ./node_modules/.bin/uglifyjs

build: css js mejs font htaccess

js: static_dir
	cat $(MEJS_DIR)/build/mediaelement-and-player.min.js ./podlove-web-player/podlove-web-player.js > $(STATIC_DIR)/podlove-web-player.tmp.js
	cat ./podlove-web-player/header.txt ./podlove-web-player/jslint.js $(STATIC_DIR)/podlove-web-player.tmp.js  > $(STATIC_DIR)/podlove-web-player.js
	$(uglifyjs) --compress --mangle -o $(STATIC_DIR)/podlove-web-player.min.js -- $(STATIC_DIR)/podlove-web-player.js
	rm  $(STATIC_DIR)/podlove-web-player.tmp.js

css: static_dir
	cat ./podlove-web-player/libs/podlove-font/css/podlovefont.css $(MEJS_DIR)/build/mediaelementplayer.css ./podlove-web-player/podlove-web-player.css > $(STATIC_DIR)/podlove-web-player.tmp.css
	cat ./podlove-web-player/header.txt $(STATIC_DIR)/podlove-web-player.tmp.css > $(STATIC_DIR)/podlove-web-player.css
	cp ./podlove-web-player/libs/podlove-font/css/podlovefont-ie7.css $(STATIC_DIR)/podlovefont-ie7.css
	$(postcss) --use autoprefixer podlove-web-player/static/podlove-web-player.css > $(STATIC_DIR)/podlove-web-player.post.css
	$(uglifycss) $(STATIC_DIR)/podlove-web-player.post.css > $(STATIC_DIR)/podlove-web-player.min.css
	rm $(STATIC_DIR)/podlove-web-player.post.css
	rm $(STATIC_DIR)/podlove-web-player.tmp.css

mejs: static_dir
	cp $(MEJS_DIR)/build/flashmediaelement.swf $(STATIC_DIR)/flashmediaelement.swf
	cp $(MEJS_DIR)/build/silverlightmediaelement.xap $(STATIC_DIR)/silverlightmediaelement.xap
	cp $(MEJS_DIR)/build/controls.svg $(STATIC_DIR)/controls.svg
	cp $(MEJS_DIR)/build/controls.png $(STATIC_DIR)/controls.png
	cp $(MEJS_DIR)/build/background.png $(STATIC_DIR)/background.png
	cp $(MEJS_DIR)/build/loading.gif $(STATIC_DIR)/loading.gif
	cp $(MEJS_DIR)/build/bigplay.svg $(STATIC_DIR)/bigplay.svg
	cp $(MEJS_DIR)/build/bigplay.png $(STATIC_DIR)/bigplay.png

font:
	cp -R ./podlove-web-player/libs/podlove-font/font/ ./podlove-web-player/font/

htaccess:
	cp ./podlove-web-player/help/xss.htaccess ./podlove-web-player/font/.htaccess

static_dir:
	mkdir -p $(STATIC_DIR)
