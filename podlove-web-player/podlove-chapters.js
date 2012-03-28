function podlove_chapters (playerid){
	new MediaElement(playerid, {
		success: function (player) { 

			var list = 'table[rel='+playerid+']';
			jQuery(list).show();

			jQuery(document).on('click', list+' a', function(){
			 player.setCurrentTime (jQuery(this).find('span').data('start'));
			 return false;
			});

			player.addEventListener('timeupdate', function(e) {
				jQuery(list+' span').each(function(i){
					var mytr = jQuery(this).closest('tr');
					var curr = jQuery(this).data('start')
					var next = jQuery(this).data('end');
					if (player.currentTime > (curr - 0.3 ) && player.currentTime <= (next) ) {
						if (!jQuery(mytr).hasClass('active')) {
							jQuery(this).closest('table').find('tr.active').removeClass('active');
							jQuery(mytr).addClass('active');
						}
					}
					if (jQuery(this).data('buffered') == '0' && player.buffered.end(0) > curr) {
						jQuery(this).data('buffered', '1').wrap('<a href="#"></a>');
					}        
				});
			}, false);
	 	}
	});
}