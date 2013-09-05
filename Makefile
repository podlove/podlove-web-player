# BUILD PWP FILES

build:
	mkdir -p ./podlove-web-player/static
	cat ./podlove-web-player/libs/podlove-font/css/podlovefont.css ./podlove-web-player/libs/mediaelement/build/mediaelementplayer.css ./podlove-web-player/podlove-web-player.css > ./podlove-web-player/static/podlove-web-player.tmp.css
	cat ./podlove-web-player/libs/mediaelement/build/mediaelement-and-player.min.js ./podlove-web-player/podlove-web-player.js > ./podlove-web-player/static/podlove-web-player.tmp.js
	cat ./podlove-web-player/header.txt ./podlove-web-player/jslint.js ./podlove-web-player/static/podlove-web-player.tmp.js  > ./podlove-web-player/static/podlove-web-player.js
	cat ./podlove-web-player/header.txt ./podlove-web-player/static/podlove-web-player.tmp.css > ./podlove-web-player/static/podlove-web-player.css
	cp ./podlove-web-player/libs/podlove-font/css/podlovefont-ie7.css ./podlove-web-player/static/podlovefont-ie7.css
	cp ./podlove-web-player/libs/mediaelement/build/flashmediaelement.swf ./podlove-web-player/static/flashmediaelement.swf
	cp ./podlove-web-player/libs/mediaelement/build/silverlightmediaelement.xap ./podlove-web-player/static/silverlightmediaelement.xap
	cp ./podlove-web-player/libs/mediaelement/build/controls.svg ./podlove-web-player/static/controls.svg
	cp ./podlove-web-player/libs/mediaelement/build/controls.png ./podlove-web-player/static/controls.png
	cp ./podlove-web-player/libs/mediaelement/build/background.png ./podlove-web-player/static/background.png
	cp ./podlove-web-player/libs/mediaelement/build/loading.gif ./podlove-web-player/static/loading.gif
	cp ./podlove-web-player/libs/jquery.ba-hashchange.min.js ./podlove-web-player/static/hashchange.min.js
	cp ./podlove-web-player/libs/mediaelement/build/bigplay.svg ./podlove-web-player/static/bigplay.svg
	cp ./podlove-web-player/libs/mediaelement/build/bigplay.png ./podlove-web-player/static/bigplay.png
	cp -R ./podlove-web-player/libs/podlove-font/font/ ./podlove-web-player/font/
	cp ./podlove-web-player/help/xss.htaccess ./podlove-web-player/font/.htaccess
	rm  ./podlove-web-player/static/podlove-web-player.tmp.css ./podlove-web-player/static/podlove-web-player.tmp.js
