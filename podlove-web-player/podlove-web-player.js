(function($) {
	'use strict';

	var startAtTime = false,
		stopAtTime = false,
		// Keep all Players on site
		players = [],
		// Timecode as described in http://podlove.org/deep-link/
		// and http://www.w3.org/TR/media-frags/#fragment-dimensions
		timecodeRegExp = /(\d+:)?(\d+):(\d+)(\.\d+)?([,-](\d+:)?(\d+):(\d+)(\.\d+)?)?/;



	$.fn.podlovewebplayer = function(options) {
		var player = this[0],
			richplayer = false,
			haschapters = false;

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
			duration: false
		}

		// Additional parameters default values
		var params = $.extend({}, {
			chapterlinks: 'all',
			width: '100%',
			duration: false,
			chaptersVisible: false,
			timecontrolsVisible: false,
			summaryVisible: false
		}, options);

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
		if (params.duration && params.duration != ~~params.duration) {
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
		if (params.width == ~~params.width) { 
			params.width += 'px'; 
		}

		var orig = player;

		player = $(player).clone().wrap('<div class="podlovewebplayer_wrapper" style="width: ' + params.width + '"></div>')[0];
		var deepLink,
			wrapper = $(player).parent();

		players.push(player);

		//add params from html fallback area
		$(this).find('[data-pwp]').each(function(){
			params[$(this).data('pwp')] = $(this).html();
			$(this).remove();
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
				
				wrapper.find('.podlovewebplayer_meta').prepend('<a class="bigplay" href="#">Play Episode</a>');
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
			}

			//always render toggler buttons wrapper
			wrapper.find('.podlovewebplayer_meta').append('<div class="togglers"></div>');
			
			if (typeof params.summary !== 'undefined') {
				var summaryActive = "";
				if (params.summaryVisible == true) {
					summaryActive = " active";
				}
				wrapper.find('.togglers').append(
					'<a href="#" class="infowindow infobuttons icon-info-sign" title="more information on the episode"></a>');
				wrapper.find('.podlovewebplayer_meta').after(
					'<div class="summary'+summaryActive+'">'+params.summary+'</div>');
			}
			if (typeof params.chapters !== 'undefined') {
				wrapper.find('.togglers').append(
					'<a href="#" class="chaptertoggle infobuttons icon-list-ul" title="show/hide chapters"></a>');
			}
			wrapper.find('.togglers').append('<a href="#" class="showcontrols infobuttons icon-time" title="show/hide controls box"></a>')
		}

		var timecontrolsActive = "";
		if (params.timecontrolsVisible == true) {
			timecontrolsActive = " active";
		}
		wrapper.append('<div class="controlbox'+timecontrolsActive+'"></div>');
		
		if (typeof params.chapters !== 'undefined') {
			wrapper.find('.controlbox').append('<a href="#" class="prevbutton infobuttons icon-step-backward" title="previous chapter"></a>'
						+'<a href="#" class="nextbutton infobuttons icon-step-forward" title="next chapter"></a>')
		}
		wrapper.find('.controlbox').append(
			'<a href="#" class="rewindbutton infobuttons icon-backward" title="Rewind 30 seconds"></a>');
		wrapper.find('.controlbox').append('<a href="#" class="forwardbutton infobuttons icon-forward" title="Skip 30 seconds"></a>');
		if (typeof wrapper.closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href') !== 'undefined') {
			wrapper.find('.controlbox').append('<a href="#" class="currentbutton infobuttons icon-link" title="get current position link"></a>');
			wrapper.find('.controlbox').append('<a href="#" target="_blank" class="tweetbutton infobuttons icon-twitter" title="tweet current position"></a>');
		}

		//build chapter table
		if (typeof params.chapters !== 'undefined') {
			haschapters = true;

			var class_names = 'podlovewebplayer_chapters';
			if (params.chapterlinks != 'false') {
				class_names += ' linked linked_'+params.chapterlinks;
			}
			var chaptersActive = "";
			if (params.chaptersVisible == true) {
				chaptersActive = " active";
			}
			var tablestring = '<div class="podlovewebplayer_chapterbox showonplay'+chaptersActive+'"><table rel="'+player.id+'" class="'+class_names+'">';
			tablestring += '<caption>Podcast Chapters</caption><thead><tr>';
			tablestring += '<th scope="col">Chapter Number</th>';
			tablestring += '<th scope="col">Start time</th>';
			tablestring += '<th scope="col">Title</th>';
			tablestring += '<th scope="col">Duration</th>';
			tablestring += '</tr></thead>';
			tablestring += '<tbody></tbody></table></div>';
			wrapper.append(tablestring);
			var table = wrapper.find('table[rel='+player.id+']');

			//prepare row data
			var tempchapters = {};
			var i = 0;
			var maxchapterlength = 0;
			var maxchapterstart  = 0;

			//first round: kill empty rows and build structured object
			$.each(params.chapters.split("\n"), function(){
				//exit early if this line contains nothing but whitespace
				if( !/\S/.test(this)){
					return;
				}

				var line = $.trim(this);
				var tc = parseTimecode(line.substring(0,line.indexOf(' ')));
				var chaptitle = $.trim(line.substring(line.indexOf(' ')));
				tempchapters[i] = {start: tc[0], title: chaptitle };
				i++;
			});

			//second round: collect more information
			$.each(tempchapters, function(i){
				if (typeof tempchapters[-~i] !== 'undefined') {
					this.end = 	tempchapters[-~i].start;
					if(Math.round(this.end-this.start) > maxchapterlength) {
						maxchapterlength = Math.round(this.end-this.start);
						maxchapterstart = Math.round(tempchapters[-~i].start);
					}
				}
			})
			
			//third round: build actual dom table
			$.each(tempchapters, function(i){
				var deeplink = document.location;

				var finalchapter = (typeof tempchapters[-~i] === 'undefined') ? true : false;
				if (!finalchapter) {
					this.end = 	tempchapters[-~i].start;
					if((maxchapterlength >= 3600)&&(Math.round(this.end-this.start) < 3600)) {
						this.duration = '00:'+generateTimecode([Math.round(this.end-this.start)]);
					} else {
						this.duration = generateTimecode([Math.round(this.end-this.start)]);
					}
				} else {
					if (params.duration == 0) {
						this.end = 9999999999;
						this.duration = '…';
					} else {
						this.end = params.duration;
						if((maxchapterlength >= 3600)&&(Math.round(this.end-this.start) < 3600)) {
							this.duration = '00:'+generateTimecode([Math.round(this.end-this.start)]);
						} else {
							this.duration = generateTimecode([Math.round(this.end-this.start)]);
						}
					}
				}

				// deeplink, start and end
				var deeplink_chap = '#t=' + generateTimecode( [this.start, this.end] );
				var oddchapter = 'oddchapter';
				if((~~i)%2) { oddchapter = ''; }
				var rowstring = '<tr class="chaptertr '+oddchapter+'" data-start="'+this.start+'" data-end="'+this.end+'">';

				if((maxchapterstart >= 3600)&&(Math.round(this.start) < 3600)) {
					rowstring += '<td class="starttime"><span>00:'+generateTimecode( [Math.round(this.start)] )+'</span></td>';
				} else {
					rowstring += '<td class="starttime"><span>'+generateTimecode( [Math.round(this.start)] )+'</span></td>';
				}

				rowstring += '<td>'+this.title+'</td>';
				rowstring += '<td class="timecode">'+"\n";
				rowstring += '<span>' + this.duration + '</span>' + "\n";
				rowstring += '</td>'+"\n";
				rowstring += '</tr>';
				table.append(rowstring);	
			});
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
			addBehavior(player, params);
			if (deepLink !== false && players.length === 1) {
				$('html, body').delay(150).animate({
					scrollTop: $('.podlovewebplayer_wrapper:first').offset().top - 25
				});
			}
		}

		$(orig).replaceWith(wrapper);
		$(player).mediaelementplayer(mejsoptions);
	};


	/**
	 * add chapter behavior and deeplinking: skip to referenced
	 * time position & write current time into address
	 * @param player object
	 */
	var addBehavior = function(player, params) {

		var jqPlayer = $(player),
			layoutedPlayer = jqPlayer,
			playerId = jqPlayer.attr('id'),
			list = $('table[rel=' + playerId + ']'),
			marks = list.find('tr'),
			canplay = false;
			
		if (players.length === 1) {
			// check if deeplink is set
			checkCurrentURL();
		}

		// get things straight for flash fallback
		if (player.pluginType == 'flash') {
			var layoutedPlayer = $('#mep_' + player.id.substring(9));
		}

		// cache some jQ objects
		var wrapper = layoutedPlayer.closest('.podlovewebplayer_wrapper'),
			metainfo = wrapper.find('.podlovewebplayer_meta'),
			summary = wrapper.find('.summary'),
			controlbox = wrapper.find('.controlbox'),
			chapterdiv = wrapper.find('.podlovewebplayer_chapterbox');
		
		// fix height of summary for better toggability
		summary.each(function() {
			$(this).data('height', $(this).height());
			if (!$(this).hasClass('active')) {
				$(this).height('0px');
			}
		})
		
		if (metainfo.length === 1) {

			metainfo.find('a.infowindow').on('click', function(){
				summary.toggleClass('active');
				if(summary.hasClass('active')) {
					summary.height(summary.data('height') + 'px');
				} else {
					summary.height('0px');
				}
				return false;
			});

			metainfo.find('a.showcontrols').on('click', function(){
				controlbox.toggleClass('active');
				return false;
			});

			metainfo.find('.bigplay').on('click', function(){
				if (player.paused) {
					player.play();
					$(this).addClass('playing');
				} else {
					player.pause();
					$(this).removeClass('playing');
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
				window.prompt('This URL directly points to the current playback position', $(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')+'#t='+generateTimecode([player.currentTime]));
				return false;
			});

			wrapper.find('.tweetbutton').click(function(){
				window.open('https://twitter.com/share?text='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text())+'&url='+encodeURI($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'))+'%23t%3D'+generateTimecode([player.currentTime]), 'tweet it', 'width=550,height=420,resizable=yes');
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
							jqPlayer.bind('canplay', function () {
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

		chapterdiv.each(function() {
			$(this).data('height', $(this).height());
			$(this).height($(this).data('height'));
			if(!$(this).hasClass('active')) {
				$(this).height('0px');
			}
		})
		
		if (chapterdiv.length === 1) {
			metainfo.find('a.chaptertoggle').on('click', function() {
				chapterdiv.toggleClass('active');
				if (chapterdiv.hasClass('active')) {
					chapterdiv.height(chapterdiv.data('height') + 'px');
				} else {
					chapterdiv.height('0px');
				}
				return false;
			});
		}

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
			jqPlayer.bind('play, playing', function(){
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
	}


	/**
	 * accepts array with start and end time in seconds
	 * returns timecode in deep-linking format
	 * @param times array
	 * @return string
	 **/
	var generateTimecode = function(times) {
		function generatePart(seconds) {
			var part, hours, milliseconds;
			// prevent negative values from player
			if (!seconds || seconds <= 0) {
				return '00:00';
			}

			// required (minutes : seconds)
			part = zeroFill(Math.floor(seconds / 60) % 60, 2) + ':' +
					zeroFill(Math.floor(seconds % 60) % 60, 2);

			hours = zeroFill(Math.floor(seconds / 60 / 60), 2);
			hours = hours === '00' ? '' : hours + ':';
			milliseconds = zeroFill(Math.floor(seconds % 1 * 1000), 3);
			milliseconds = milliseconds === '000' ? '' : '.' + milliseconds;

			return hours + part + milliseconds;
		}

		if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
			return generatePart(times[0]) + ',' + generatePart(times[1]);
		}

		return generatePart(times[0]);
	}

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
				startTime += parts[1] ? ~~parts[1] * 60 * 60 : 0;
				// minutes
				startTime += ~~parts[2] * 60;
				// seconds
				startTime += ~~parts[3];
				// milliseconds
				startTime += parts[4] ? parseFloat(parts[4]) : 0;
				// no negative time
				startTime = Math.max(startTime, 0);

				// if there only a startTime but no endTime
				if (parts[5] === undefined) {
					return [startTime, false];
				}

				// hours
				endTime += parts[6] ? ~~parts[6] * 60 * 60 : 0;
				// minutes
				endTime += ~~parts[7] * 60;
				// seconds
				endTime += ~~parts[8];
				// milliseconds
				endTime += parts[9] ? parseFloat(parts[9]) : 0;
				// no negative time
				endTime = Math.max(endTime, 0);

				return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
			}
		}
		return false;
	}

	var checkCurrentURL = function() {
		var deepLink;
		deepLink = parseTimecode(window.location.href);
		if (deepLink !== false) {
			startAtTime = deepLink[0];
			stopAtTime = deepLink[1];
		}
	}

	var setFragmentURL = function(fragment) {
		var url;
		window.location.hash = fragment;
	}

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
	}

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
	}

	var addressCurrentTime = function(e) {
		var fragment;
		if (players.length === 1) {
			fragment = 't=' + generateTimecode([e.data.player.currentTime]);
			setFragmentURL(fragment);
		}
	}
	
}(jQuery));