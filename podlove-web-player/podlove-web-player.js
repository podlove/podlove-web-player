/* PWP 2.0.5 */

(function($) {
	'use strict';

	var startAtTime = false,
		stopAtTime = false,
		// Keep all Players on site
		players = [],
		// Timecode as described in http://podlove.org/deep-link/
		// and http://www.w3.org/TR/media-frags/#fragment-dimensions
		timecodeRegExp = /(?:(\d+):)?(\d+):(\d+)(\.\d+)?([,-](?:(\d+):)?(\d+):(\d+)(\.\d+)?)?/;



	$.fn.podlovewebplayer = function(options) {

		// MEJS options default values
		var mejsoptions = {
			defaultVideoWidth: 480,
			defaultVideoHeight: 270,
			videoWidth: -1,
			videoHeight: -1,
			audioWidth: -1,
			audioHeight: 30,
			startVolume: 0.8,
			loop: false,
			enableAutosize: true,
			features: ['playpause','current','progress','duration','tracks','volume','fullscreen'],
			alwaysShowControls: false,
			iPadUseNativeControls: false,
			iPhoneUseNativeControls: false,
			AndroidUseNativeControls: false,
			alwaysShowHours: false,
			showTimecodeFrameCount: false,
			framesPerSecond: 25,
			enableKeyboard: true,
			pauseOtherPlayers: true,
			duration: false,
			plugins: ['flash', 'silverlight'],
			flashName: 'flashmediaelement.swf',
			silverlightName: 'silverlightmediaelement.xap'
		};

		// Additional parameters default values
		var params = $.extend({}, {
			chapterlinks: 'all',
			width: '100%',
			duration: false,
			chaptersVisible: false,
			timecontrolsVisible: false,
			sharebuttonsVisible: false,
			downloadbuttonsVisible: false,
			summaryVisible: false,
			hidetimebutton: false,
			hidedownloadbutton: false,
			hidesharebutton: false,
			sharewholeepisode: false,
			sources: []
		}, options);

		// turn each player in the current set into a Podlove Web Player
		return this.each(function(index, player){

			var richplayer = false,
				haschapters = false;

			//fine tuning params
			if (params.width.toLowerCase() == 'auto') {
				params.width = '100%';
			} else {
				params.width = params.width.replace('px', '');
			}

			//audio params
			if (player.tagName == 'AUDIO') {
				if (typeof params.audioWidth !== 'undefined') {
					params.width = params.audioWidth;
				}
				mejsoptions.audioWidth = params.width;
				
				//kill fullscreen button
				$.each(mejsoptions.features, function(i){
					if (this == 'fullscreen') {
						mejsoptions.features.splice(i, 1);		
					}
				});

			//video params
			} else if (player.tagName == 'VIDEO') {

				if (typeof params.height !== 'undefined') {
					mejsoptions.videoWidth = params.width;
					mejsoptions.videoHeight = params.height;
				}

			 	if (typeof $(player).attr('width') !== 'undefined') {
					params.width = $(player).attr('width');
				}
			}

			//duration can be given in seconds or in timecode format
			if (params.duration && params.duration != parseInt( params.duration, 10)) {
				var secArray = parseTimecode(params.duration);
				params.duration = secArray[0];
			}
			
			//Overwrite MEJS default values with actual data
			$.each(mejsoptions, function(key, value){
				if (typeof params[key] !== 'undefined') {
					mejsoptions[key] = params[key];
				}
			});

			//wrapper and init stuff
			if (params.width == parseInt( params.width, 10)) {
				params.width += 'px';
			}

			var orig = player;

			player = $(player).clone().wrap('<div class="podlovewebplayer_wrapper" style="width: ' + params.width + '"></div>')[0];
			var deepLink,
				wrapper = $(player).parent();

			players.push(player);

			//add params from html fallback area and remove them from the DOM-tree
			$(player).find('[data-pwp]').each(function(){
				params[$(this).data('pwp')] = $(this).html();
				$(this).remove();
			});
			//add params from audio and video elements
			$(player).find('source').each(function(){
				if(typeof params['sources'] !== 'undefined') {
					params.sources.push($(this).attr('src'));
				} else {
					params[sources][0] = $(this).attr('src');
				}
			});

			//build rich player with meta data
			if (  typeof params.chapters !== 'undefined' ||
					typeof params.title !== 'undefined' ||
					typeof params.subtitle !== 'undefined' ||
					typeof params.summary !== 'undefined' ||
					typeof params.poster !== 'undefined' ||
					typeof $(player).attr('poster') !== 'undefined'
					) {

				//set status variable
				var richplayer = true;
				
				wrapper.addClass('podlovewebplayer_' + player.tagName.toLowerCase());

				if(player.tagName == "AUDIO") {
					
					//kill play/pause button from miniplayer
					$.each(mejsoptions.features, function(i){
						if (this == 'playpause') {
							mejsoptions.features.splice(i,1);		
						}
					});
					
					wrapper.prepend('<div class="podlovewebplayer_meta"></div>');
					
					wrapper.find('.podlovewebplayer_meta').prepend('<a class="bigplay" title="Play Episode" href="#"></a>');
					if (typeof params.poster !== 'undefined') {
						wrapper.find('.podlovewebplayer_meta').append(
							'<div class="coverart"><img src="'+params.poster+'" alt=""></div>');
					}
					if (typeof $(player).attr('poster') !== 'undefined') {
						wrapper.find('.podlovewebplayer_meta').append(
							'<div class="coverart"><img src="'+$(player).attr('poster')+'" alt=""></div>');
					}
				}

				if (player.tagName == "VIDEO") {
					wrapper.prepend('<div class="podlovewebplayer_top"></div>');
					wrapper.append('<div class="podlovewebplayer_meta"></div>');
				}
				
				if (typeof params.title !== 'undefined') {
					if (typeof params.permalink !== 'undefined') {
						wrapper.find('.podlovewebplayer_meta').append(
							'<h3 class="episodetitle"><a href="'+params.permalink+'">'+params.title+'</a></h3>');
					} else {
						wrapper.find('.podlovewebplayer_meta').append(
							'<h3 class="episodetitle">'+params.title+'</h3>');
					}
				}
				if (typeof params.subtitle !== 'undefined') {
					wrapper.find('.podlovewebplayer_meta').append(
						'<div class="subtitle">'+params.subtitle+'</div>');
				} else {
					if (typeof params.title !== 'undefined') {
						if (params.title.length < 42) {
							wrapper.addClass('podlovewebplayer_smallplayer');
						}
					}
					wrapper.find('.podlovewebplayer_meta').append(
						'<div class="subtitle"></div>');
				}

				//always render toggler buttons wrapper
				wrapper.find('.podlovewebplayer_meta').append('<div class="togglers"></div>');
				wrapper.on('playerresize', function (event) {
					wrapper.find('.podlovewebplayer_chapterbox').data('height', wrapper.find('.podlovewebplayer_chapters').height());
					if(wrapper.find('.podlovewebplayer_chapterbox').hasClass('active')) {
						wrapper.find('.podlovewebplayer_chapterbox').height(wrapper.find('.podlovewebplayer_chapters').height()+'px');
					}
				});
				
				if (typeof params.summary !== 'undefined') {
					var summaryActive = "";
					if (params.summaryVisible === true) {
						summaryActive = " active";
					}
					wrapper.find('.togglers').append(
						'<a href="#" class="infowindow infobuttons pwp-icon-info-circle" title="More information about this"></a>');
					wrapper.find('.podlovewebplayer_meta').after(
						'<div class="summary'+summaryActive+'">'+params.summary+'</div>');
				}
				if (typeof params.chapters !== 'undefined') {
					wrapper.find('.togglers').append(
						'<a href="#" class="chaptertoggle infobuttons pwp-icon-list-bullet" title="Show/hide chapters"></a>');
				}
				if (params.hidetimebutton !== true) {
					wrapper.find('.togglers').append('<a href="#" class="showcontrols infobuttons pwp-icon-clock" title="Show/hide time navigation controls"></a>');
				}
			}

			var timecontrolsActive = "";
			if (params.timecontrolsVisible === true) {
				timecontrolsActive = " active";
			}
			var sharebuttonsActive = "";
			if (params.sharebuttonsVisible === true) {
				sharebuttonsActive = " active";
			}
			var downloadbuttonsActive = "";
			if (params.downloadbuttonsVisible === true) {
				downloadbuttonsActive = " active";
			}

			wrapper.append('<div class="podlovewebplayer_timecontrol podlovewebplayer_controlbox'+timecontrolsActive+'"></div>');
			
			if (typeof params.chapters !== 'undefined') {
				wrapper.find('.podlovewebplayer_timecontrol').append('<a href="#" class="prevbutton infobuttons pwp-icon-to-start" title="Jump backward to previous chapter"></a><a href="#" class="nextbutton infobuttons pwp-icon-to-end" title="next chapter"></a>')
				wrapper.find('.controlbox').append('<a href="#" class="prevbutton infobuttons pwp-icon-step-backward" title="previous chapter"></a><a href="#" class="nextbutton infobuttons pwp-icon-to-end" title="Jump to next chapter"></a>');
			}
			wrapper.find('.podlovewebplayer_timecontrol').append(
				'<a href="#" class="rewindbutton infobuttons pwp-icon-fast-bw" title="Rewind 30 seconds"></a>');
			wrapper.find('.podlovewebplayer_timecontrol').append('<a href="#" class="forwardbutton infobuttons pwp-icon-fast-fw" title="Fast forward 30 seconds"></a>');
			if ((typeof wrapper.closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href') !== 'undefined')&&(params.hidesharebutton !== true)) {
				wrapper.append('<div class="podlovewebplayer_sharebuttons podlovewebplayer_controlbox'+sharebuttonsActive+'"></div>');
				wrapper.find('.togglers').append('<a href="#" class="showsharebuttons infobuttons pwp-icon-export" title="Show/hide sharing controls"></a>')
				wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" class="currentbutton infobuttons pwp-icon-link" title="Get URL for this"></a>');
				wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="tweetbutton infobuttons pwp-icon-twitter" title="Share this on Twitter"></a>');
				wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="fbsharebutton infobuttons pwp-icon-facebook" title="Share this on Facebook"></a>');
				wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="gplusbutton infobuttons pwp-icon-gplus" title="Share this on Google+"></a>');
				wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="adnbutton infobuttons pwp-icon-appnet" title="Share this on App.net"></a>');
				wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="mailbutton infobuttons pwp-icon-mail" title="Share this via e-mail"></a>');
			}
			if (((typeof params.downloads !== 'undefined')||(typeof params.sources !== 'undefined'))&&(params.hidedownloadbutton !== true)) {
				var key, size, name, selectform = '<select name="downloads" class="fileselect" size="1" onchange="this.value=this.options[this.selectedIndex].value;">';
				wrapper.append('<div class="podlovewebplayer_downloadbuttons podlovewebplayer_controlbox'+downloadbuttonsActive+'"></div>');
				wrapper.find('.togglers').append('<a href="#" class="showdownloadbuttons infobuttons pwp-icon-download" title="Show/hide download bar"></a>');
				if (typeof params.downloads !== 'undefined') {
					for (key in params.downloads) {
						size = (parseInt(params.downloads[key]['size'],10) < 1048704) ? Math.round(parseInt(params.downloads[key]['size'],10)/100)/10+'kB' : Math.round(parseInt(params.downloads[key]['size'],10)/1000/100)/10+'MB';
						selectform += '<option value="'+params.downloads[key]['url']+'" data-url="'+params.downloads[key]['url']+'" data-dlurl="'+params.downloads[key]['dlurl']+'">'+params.downloads[key]['name']+' (<small>'+size+'</small>)</option>';
					}
				} else {
					for (key in params.sources) {
						name = params.sources[key].split('.');
						name = name[name.length-1];
						selectform += '<option value="'+params.sources[key]+'" data-url="'+params.sources[key]+'" data-dlurl="'+params.sources[key]+'">'+name+'</option>';
					}
				}
				
				selectform += '</select>';
				wrapper.find('.podlovewebplayer_downloadbuttons').append(selectform);
				if (typeof params.downloads !== 'undefined') {
					wrapper.find('.podlovewebplayer_downloadbuttons').append('<a href="#" class="downloadbutton infobuttons pwp-icon-download" title="Download"> <span>Download</span></a> ');
				}
				wrapper.find('.podlovewebplayer_downloadbuttons').append('<a href="#" class="openfilebutton infobuttons pwp-icon-link-ext" title="Open"> <span>Open</span></a> ');
				wrapper.find('.podlovewebplayer_downloadbuttons').append('<a href="#" class="fileinfobutton infobuttons pwp-icon-info-circle" title="Info"> <span>Info</span></a> ');
			}

			//build chapter table
			if (typeof params.chapters !== 'undefined') {
				haschapters = true;

				generateChapterTable(params).appendTo(wrapper);
			}

			if (richplayer || haschapters) {
				wrapper.append('<div class="podlovewebplayer_tableend"></div>');
			}
			

			// parse deeplink
			deepLink = parseTimecode(window.location.href);
			if (deepLink !== false && players.length === 1) {
				$(player).attr({preload: 'auto', autoplay: 'autoplay'});
				startAtTime = deepLink[0];
				stopAtTime = deepLink[1];
			}

			// init MEJS to player
			mejsoptions.success = function (player) {
				addBehavior(player, params, wrapper);
				if (deepLink !== false && players.length === 1) {
					$('html, body').delay(150).animate({
						scrollTop: $('.podlovewebplayer_wrapper:first').offset().top - 25
					});
				}
			};

			$(orig).replaceWith(wrapper);
			$(player).mediaelementplayer(mejsoptions);
		});
	};

	/**
	 * Given a list of chapters, this function creates the chapter table for the player.
	 */
	var generateChapterTable = function( params){
		
		var div = $(
			'<div class="podlovewebplayer_chapterbox showonplay"><table>'
			+ '<caption>Podcast Chapters</caption><thead><tr>'
			+ '<th scope="col">Chapter Number</th>'
			+ '<th scope="col">Start time</th>'
			+ '<th scope="col">Title</th>'
			+ '<th scope="col">Duration</th>'
			+ '</tr></thead>'
			+ '<tbody></tbody></table></div>'),
			table = div.children('table'),
			tbody = table.children('tbody');

		if (params.chaptersVisible === true) {
			div.addClass('active');
		}

		table.addClass('podlovewebplayer_chapters');
		if (params.chapterlinks != 'false') {
			table.addClass('linked linked_'+params.chapterlinks);
		}


		//prepare row data
		var tempchapters = [];
		var maxchapterstart  = 0;

		//first round: kill empty rows and build structured object
		$.each(params.chapters.split("\n"), function(i, chapter){

			//exit early if this line contains nothing but whitespace
			if( !/\S/.test(chapter)) return;

			//extract the timestamp
			var line = $.trim(chapter);
			var tc = parseTimecode(line.substring(0,line.indexOf(' ')));
			var chaptitle = $.trim(line.substring(line.indexOf(' ')));
			tempchapters.push({start: tc[0], title: chaptitle });
		});

		//second round: collect more information
		maxchapterstart = Math.max.apply( Math,
			$.map(tempchapters, function( value, i){
				var next = tempchapters[i+1];

				// we use `this.end` to quickly calculate the duration in the next round
				if( next){
					value.end = next.start;
				}

				// we need this data for proper formatting
				return value.start;
			})
		);


		//this is a "template" for each chapter row
		var rowDummy = $(
			'<tr class="chaptertr" data-start="" data-end="">'
			+ '<td class="starttime"><span></span></td>'
			+ '<td class="chaptername"></td>'
			+ '<td class="timecode">\n'
			+ '<span></span>\n'
			+ '</td>\n'
			+ '</tr>');

		//third round: build actual dom table
		$.each(tempchapters, function(i){
			var finalchapter = !tempchapters[i+1],
				duration = Math.round(this.end-this.start),
				forceHours,
				row = rowDummy.clone();

			//make sure the duration for all chapters are equally formatted
			if (!finalchapter) {
				this.duration = generateTimecode([duration], false);
			} else {
				if (params.duration == 0) {
					this.end = 9999999999;
					this.duration = '…';
				} else {
					this.end = params.duration;
					this.duration = generateTimecode([Math.round(this.end-this.start)], false);
				}
			}


			if(i % 2) {
				row.addClass('oddchapter');
			}

			//deeplink, start and end
			row.attr({
				'data-start': this.start,
				'data-end' : this.end
			});

			//if there is a chapter that starts after an hour, force '00:' on all previous chapters
			forceHours = (maxchapterstart >= 3600);

			//insert the chapter data
			row.find('.starttime > span').text( generateTimecode([Math.round(this.start)], true, forceHours));
			row.find('.chaptername').html(this.title);
			row.find('.timecode > span').text( this.duration);

			row.appendTo( tbody);
		});


		return div;
	};


	/**
	 * add chapter behavior and deeplinking: skip to referenced
	 * time position & write current time into address
	 * @param player object
	 */
	var addBehavior = function(player, params, wrapper) {
		var jqPlayer = $(player),
			layoutedPlayer = jqPlayer,
			canplay = false;

		/**
		 * The `player` is an interface. It provides the play and pause functionality. The
		 * `layoutedPlayer` on the other hand is a DOM element. In native mode, these two
		 * are one and the same object. In Flash though the interface is a plain JS object.
		 */
			
		if (players.length === 1) {
			// check if deeplink is set
			checkCurrentURL();
		}

		// get things straight for flash fallback
		if (player.pluginType == 'flash') {
			layoutedPlayer = $('#mep_' + player.id.substring(9));
		}

		// cache some jQ objects
		var metainfo = wrapper.find('.podlovewebplayer_meta'),
			summary = wrapper.find('.summary'),
			podlovewebplayer_timecontrol = wrapper.find('.podlovewebplayer_timecontrol'),
			podlovewebplayer_sharebuttons = wrapper.find('.podlovewebplayer_sharebuttons'),
			podlovewebplayer_downloadbuttons = wrapper.find('.podlovewebplayer_downloadbuttons'),
			chapterdiv = wrapper.find('.podlovewebplayer_chapterbox'),
			list = wrapper.find('table'),
			marks = list.find('tr');

		// fix height of summary for better toggability
		summary.each(function() {
			$(this).data('height', $(this).height());
			if (!$(this).hasClass('active')) {
				$(this).height('0px');
			} else {
				$(this).height($(this).height()+'px');
			}
		});

		chapterdiv.each(function() {
			$(this).data('height', $(this).find('.podlovewebplayer_chapters').height());
			if (!$(this).hasClass('active')) {
				$(this).height('0px');
			} else {
				$(this).height($(this).find('.podlovewebplayer_chapters').height()+'px');
			}
		});

		if (metainfo.length === 1) {

			metainfo.find('a.infowindow').click(function(){
				summary.toggleClass('active');
				if(summary.hasClass('active')) {
					summary.height(summary.data('height') + 'px');
				} else {
					summary.height('0px');
				}
				return false;
			});

			metainfo.find('a.showcontrols').on('click', function(){
				podlovewebplayer_timecontrol.toggleClass('active');
				if(typeof podlovewebplayer_sharebuttons != 'undefined') {
					if(podlovewebplayer_sharebuttons.hasClass('active')) {
						podlovewebplayer_sharebuttons.removeClass('active');
					} else if(podlovewebplayer_downloadbuttons.hasClass('active')) {
						podlovewebplayer_downloadbuttons.removeClass('active');
					}
				}
				return false;
			});

			metainfo.find('a.showsharebuttons').on('click', function(){
				podlovewebplayer_sharebuttons.toggleClass('active');
				if(podlovewebplayer_timecontrol.hasClass('active')) {
					podlovewebplayer_timecontrol.removeClass('active');
				} else if(podlovewebplayer_downloadbuttons.hasClass('active')) {
					podlovewebplayer_downloadbuttons.removeClass('active');
				}
				return false;
			});

			metainfo.find('a.showdownloadbuttons').on('click', function(){
				podlovewebplayer_downloadbuttons.toggleClass('active');
				if(podlovewebplayer_timecontrol.hasClass('active')) {
					podlovewebplayer_timecontrol.removeClass('active');
				} else if(podlovewebplayer_sharebuttons.hasClass('active')) {
					podlovewebplayer_sharebuttons.removeClass('active');
				}
				return false;
			});

			metainfo.find('.bigplay').on('click', function(){
				if($(this).hasClass('bigplay')) {
					if((typeof player.currentTime === 'number')&&(player.currentTime > 0)) {
						if (player.paused) {
							$(this).parent().find('.bigplay').addClass('playing');
							player.play();
						} else {
							$(this).parent().find('.bigplay').removeClass('playing');
							player.pause();
						}
					} else {
						if(!$(this).parent().find('.bigplay').hasClass('playing')) {
							$(this).parent().find('.bigplay').addClass('playing');
							$(this).parent().parent().find('.mejs-time-buffering').show();
						}
						// flash fallback needs additional pause
						if (player.pluginType == 'flash') {
							player.pause();
						}
						player.play();
					}
				}
				return false;
			});

			wrapper.find('.chaptertoggle').unbind('click').click(function(){
				wrapper.find('.podlovewebplayer_chapterbox').toggleClass('active');
				if (wrapper.find('.podlovewebplayer_chapterbox').hasClass('active')) {
					wrapper.find('.podlovewebplayer_chapterbox').height(wrapper.find('.podlovewebplayer_chapterbox').data('height') + 'px');
				} else {
					wrapper.find('.podlovewebplayer_chapterbox').height('0px');
				}
				return false;
			});

			wrapper.find('.prevbutton').click(function(){
				if ((typeof player.currentTime === 'number')&&(player.currentTime > 0)) {
					if(player.currentTime > chapterdiv.find('.active').data('start')+10) {
						player.setCurrentTime(chapterdiv.find('.active').data('start'));
					} else {
						player.setCurrentTime(chapterdiv.find('.active').prev().data('start'));
					}					
				} else {
					player.play();
				}
				return false;
			});

			wrapper.find('.nextbutton').click(function(){
				if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
					player.setCurrentTime(chapterdiv.find('.active').next().data('start'));
				} else {
					player.play();
				}
				return false;
			});

			wrapper.find('.rewindbutton').click(function(){
				if((typeof player.currentTime === 'number')&&(player.currentTime > 0)) {
					player.setCurrentTime(player.currentTime - 30);
				} else {
					player.play();
				}
				return false;
			});

			wrapper.find('.forwardbutton').click(function(){
				if((typeof player.currentTime === 'number')&&(player.currentTime > 0)) {
					player.setCurrentTime(player.currentTime+30);
				} else {
					player.play();
				}
				return false;
			});

			wrapper.find('.currentbutton').click(function(){
				var timepos = (params.sharewholeepisode === true) ? '' : '%23t%3D'+generateTimecode([player.currentTime]);
				window.prompt('This URL directly points to the current playback position', $(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'))+timepos;
				return false;
			});

			wrapper.find('.tweetbutton').click(function(){
				var timepos = (params.sharewholeepisode === true) ? '' : '%23t%3D'+generateTimecode([player.currentTime]);
				window.open('https://twitter.com/share?text='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text())+'&url='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'))+timepos, 'tweet it', 'width=550,height=420,resizable=yes');
				return false;
			});

			wrapper.find('.fbsharebutton').click(function(){
				var timepos = (params.sharewholeepisode === true) ? '' : '%23t%3D'+generateTimecode([player.currentTime]);
				window.open('http://www.facebook.com/share.php?t='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text())+'&u='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'))+timepos, 'share it', 'width=550,height=340,resizable=yes');
				return false;
			});

			wrapper.find('.gplusbutton').click(function(){
				var timepos = (params.sharewholeepisode === true) ? '' : '%23t%3D'+generateTimecode([player.currentTime]);
				window.open('https://plus.google.com/share?title='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text())+'&url='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'))+timepos, 'plus it', 'width=550,height=420,resizable=yes');
				return false;
			});

			wrapper.find('.adnbutton').click(function(){
				var timepos = (params.sharewholeepisode === true) ? '' : '%23t%3D'+generateTimecode([player.currentTime]);
				window.open('https://alpha.app.net/intent/post?text='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text())+'%20'+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'))+timepos, 'plus it', 'width=550,height=420,resizable=yes');
				return false;
			});

			wrapper.find('.mailbutton').click(function(){
				var timepos = (params.sharewholeepisode === true) ? '' : '%23t%3D'+generateTimecode([player.currentTime]);
				window.location = 'mailto:?subject='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text())+'&body='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text())+'%20%3C'+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'))+timepos+'%3E';
				return false;
			});

			wrapper.find('.downloadbutton').click(function(){
				$(this).parent().find(".fileselect option:selected").each(function() {
					window.location = $(this).data('dlurl');
				});
				return false;
			});

			wrapper.find('.openfilebutton').click(function(){
				$(this).parent().find(".fileselect option:selected").each(function() {
					window.open($(this).data('url'), 'Podlove Popup', 'width=550,height=420,resizable=yes');
				});
				return false;
			});

			wrapper.find('.fileinfobutton').click(function(){
				$(this).parent().find(".fileselect option:selected").each(function() {
					window.prompt('file URL:', $(this).val());
				});
				return false;
			});
		}
		
		// chapters list
		list
			.show()
			.delegate('.chaptertr', 'click', function (e) {
				if ($(this).closest('table').hasClass('linked_all') || $(this).closest('tr').hasClass('loaded')) {
					e.preventDefault();
					var mark = $(this).closest('tr'),
						startTime = mark.data('start'),
						endTime = mark.data('end');

					// If there is only one player also set deepLink
					if (players.length === 1) {
						// setFragmentURL('t=' + generateTimecode([startTime, endTime]));
						setFragmentURL('t=' + generateTimecode([startTime]));
					} else {
						if (canplay) {
							// Basic Chapter Mark function (without deeplinking)
							player.setCurrentTime(startTime);
						} else {
							jqPlayer.one('canplay', function () {
								player.setCurrentTime(startTime);
							});
						}
					}

					// flash fallback needs additional pause
					if (player.pluginType == 'flash') {
						player.pause();
					}
					player.play();
				}
				return false;
			});

		// wait for the player or you'll get DOM EXCEPTIONS
		jqPlayer.bind('canplay', function () {
			canplay = true;

			// add duration of final chapter
			if (player.duration) {
				marks.find('.timecode code').eq(-1).each(function(){
					var start = Math.floor($(this).closest('tr').data('start'));
					var end = Math.floor(player.duration);
					$(this).text(generateTimecode([end-start]));
				});
			}

			// add Deeplink Behavior if there is only one player on the site
			if (players.length === 1) {
				jqPlayer.bind('play timeupdate', {player: player}, checkTime)
					.bind('pause', {player: player}, addressCurrentTime);
				// disabled 'cause it overrides chapter clicks
				// bind seeked to addressCurrentTime

				checkCurrentURL();

				// handle browser history navigation
				$(window).bind('hashchange onpopstate', checkCurrentURL);

			}

			// always update Chaptermarks though
			jqPlayer.bind('timeupdate', function () {
				updateChapterMarks(player, marks);
			});

			// update play/pause status
			jqPlayer.bind('play playing', function(){
				list.find('.paused').removeClass('paused');
				if (metainfo.length === 1) {
					metainfo.find('.bigplay').addClass('playing');
				}
			});
			jqPlayer.bind('pause', function(){
				if (metainfo.length === 1) {
					metainfo.find('.bigplay').removeClass('playing');
				}
			});
		});
	};


	/**
	 * return number as string lefthand filled with zeros
	 * @param number number
	 * @param width number
	 * @return string
	 **/
	var zeroFill = function(number, width) {
		width -= number.toString().length;
		return width > 0 ? new Array(width + 1).join('0') + number : number + '';
	};


	/**
	 * accepts array with start and end time in seconds
	 * returns timecode in deep-linking format
	 * @param times array
	 * @param forceHours bool (optional)
	 * @return string
	 **/
	var generateTimecode = $.generateTimecode = function(times, leadingZeros, forceHours) {
		function generatePart(time) {
			var part, hours, minutes, seconds, milliseconds;
			// prevent negative values from player
			if (!time || time <= 0) {
				return leadingZeros ? (forceHours ? '00:00:00' : '00:00') : '--';
			}

			hours = Math.floor(time / 60 / 60);
			minutes = Math.floor(time / 60) % 60;
			seconds = Math.floor(time % 60) % 60;
			milliseconds = Math.floor(time % 1 * 1000);

			if( leadingZeros){
				// required (minutes : seconds)
				part = zeroFill(minutes, 2) + ':' +
						zeroFill(seconds, 2);
				hours = zeroFill(hours, 2);
				hours = hours === '00' && !forceHours ? '' : hours + ':';
				milliseconds = milliseconds ? '.' + zerofill( milliseconds, 3) : '';
			} else {
				part = hours ? zeroFill(minutes, 2) : minutes + '';
				part += ':' + zeroFill(seconds, 2);
				hours = hours ?  hours + ':' : '';
				milliseconds = milliseconds ? '.' + milliseconds : '';
			}

			return hours + part + milliseconds;
		}

		if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
			return generatePart(times[0]) + ',' + generatePart(times[1]);
		}

		return generatePart(times[0]);
	};

	/**
	 * parses time code into seconds
	 * @param string timecode
	 * @return number
	 **/
	var parseTimecode = function(timecode) {
		var parts, startTime = 0, endTime = 0;

		if (timecode) {
			parts = timecode.match(timecodeRegExp);

			if (parts && parts.length === 10) {
				// hours
				startTime += parts[1] ? parseInt( parts[1], 10) * 60 * 60 : 0;
				// minutes
				startTime += parseInt( parts[2], 10) * 60;
				// seconds
				startTime += parseInt( parts[3], 10);
				// milliseconds
				startTime += parts[4] ? parseFloat( parts[4]) : 0;
				// no negative time
				startTime = Math.max(startTime, 0);

				// if there only a startTime but no endTime
				if (parts[5] === undefined) {
					return [startTime, false];
				}

				// hours
				endTime += parts[6] ? parseInt( parts[6], 10) * 60 * 60 : 0;
				// minutes
				endTime += parseInt( parts[7], 10) * 60;
				// seconds
				endTime += parseInt( parts[8], 10);
				// milliseconds
				endTime += parts[9] ? parseFloat( parts[9]) : 0;
				// no negative time
				endTime = Math.max(endTime, 0);

				return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
			}
		}
		return false;
	};

	var checkCurrentURL = function() {
		var deepLink;
		deepLink = parseTimecode(window.location.href);
		if (deepLink !== false) {
			startAtTime = deepLink[0];
			stopAtTime = deepLink[1];
		}
	};

	var setFragmentURL = function(fragment) {
		var url;
		window.location.hash = fragment;
	};

	// update the chapter list when the data is loaded
	var updateChapterMarks = function(player, marks) {
		var doLinkMarks = marks.closest('table').hasClass('linked');

		marks.each(function () {
			var deepLink,
				mark       = $(this),
				startTime  = mark.data('start'),
				endTime    = mark.data('end'),
				isEnabled  = mark.data('enabled'),
				// isBuffered = player.buffered.end(0) > startTime,
				isActive   = player.currentTime > startTime - 0.3 &&
						player.currentTime <= endTime;

			// prevent timing errors
			if (player.buffered.length > 0) {
			  var isBuffered = player.buffered.end(0) > startTime;
			}

			if (isActive) {
				mark.addClass('active').siblings().removeClass('active');
			}
			if (!isEnabled && isBuffered) {
				deepLink = '#t=' + generateTimecode([startTime, endTime]);
				$(mark).data('enabled', true).addClass('loaded').find('a[rel=player]').removeClass('disabled');
			}
		});
	};

	var checkTime = function (e) {
		if (players.length > 1) { return; }
		var player = e.data.player;
		if (startAtTime !== false && 
				//Kinda hackish: Make sure that the timejump is at least 1 second (fix for OGG/Firefox)
				(typeof player.lastCheck === 'undefined' || Math.abs(startAtTime - player.lastCheck) > 1)) {
			player.setCurrentTime(startAtTime);
			player.lastCheck = startAtTime;
			startAtTime = false;
		}
		if (stopAtTime !== false && player.currentTime >= stopAtTime) {
			player.pause();
			stopAtTime = false;
		}
	};

	var addressCurrentTime = function(e) {
		var fragment;
		if (players.length === 1) {
			fragment = 't=' + generateTimecode([e.data.player.currentTime]);
			setFragmentURL(fragment);
		}
	};
	
}(jQuery));
