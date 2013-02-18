<?php
/**
 * @package PodloveWebPlayer
 * @version 2.0.2
 */

/*
Plugin Name: Podlove Web Player
Plugin URI: http://podlove.org/podlove-web-player/
Description: Video and audio plugin for WordPress built on the MediaElement.js HTML5 media player library.
Author: Gerrit van Aaken and others
Version: 2.0.2
Author URI: http://praegnanz.de
License: GPLv3, MIT

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License, version 2, as 
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

Forked from: http://mediaelementjs.com/ plugin
which was adapted from: http://videojs.com/ plugin
*/


if ( // Prevent conflicts with already running versions of PWP
	!function_exists( 'podlovewebplayer_install' ) &&
	!function_exists( 'podlove_pwp_install' ) ) { 


/* global-ish init variables */
$pluginpath = explode( "/", __FILE__ );
$plugindir = '/' . $pluginpath[ count( $pluginpath ) - 2 ] . '/';

$podlovewebplayer_index = 1;
define( 'PODLOVEWEBPLAYER_DIR', WP_PLUGIN_URL . $plugindir );
define( 'PODLOVEWEBPLAYER_MEJS_DIR', PODLOVEWEBPLAYER_DIR . 'libs/mediaelement/build/' );

/* Activation and De-Activation */

function podlovewebplayer_install() {
	add_option( 'podlovewebplayer_options' );
}
function podlovewebplayer_remove() {
	delete_option( 'podlovewebplayer_options' );
}
register_activation_hook( __FILE__, 'podlovewebplayer_install' );
register_deactivation_hook( __FILE__, 'podlovewebplayer_remove' );


/* create custom plugin settings menu */

include_once( WP_PLUGIN_DIR . $plugindir . 'settings.php' );


/* embed javascript files */

function podlovewebplayer_add_scripts() {
	if ( !is_admin() ) {
		wp_enqueue_script( 
			'mediaelementjs', 
			PODLOVEWEBPLAYER_MEJS_DIR . 'mediaelement-and-player.min.js', 
			array('jquery'), '2.10.3', false 
		);
		wp_enqueue_script( 
			'ba_hashchange', 
			PODLOVEWEBPLAYER_DIR . 'libs/jquery.ba-hashchange.min.js', 
			array('jquery'), '1.3.0', false
		);
		wp_enqueue_script( 
			'podlovewebplayer', 
			PODLOVEWEBPLAYER_DIR . 'podlove-web-player.js', 
			array('jquery', 'mediaelementjs'), '2.0.2', false
		);
	}
}
add_action('wp_print_scripts', 'podlovewebplayer_add_scripts');



/* embed css files */

function podlovewebplayer_add_styles() {
	if ( !is_admin() ) {
		wp_enqueue_style( 'fontawesome', PODLOVEWEBPLAYER_DIR . 'libs/fontawesome/css/font-awesome.min.css' );
		wp_enqueue_style( 'mediaelementjs', PODLOVEWEBPLAYER_MEJS_DIR . 'mediaelementplayer.css' );
		wp_enqueue_style( 'podlovewebplayer', PODLOVEWEBPLAYER_DIR . 'podlove-web-player.css' );
	}
}
add_action( 'wp_print_styles', 'podlovewebplayer_add_styles' );



/* ---------------------------------------- render player on shortcode */

function podlovewebplayer_render_player( $tag_name, $atts ) {

	global $podlovewebplayer_index;
	$attributes = array();
	$sources = array();
	$wp_options = get_option('podlovewebplayer_options');

	extract(shortcode_atts(array(
		'src' => '',
		'mp4' => '',
		'mp3' => '',
		'wmv' => '',
		'webm' => '',
		'flv' => '',
		'ogg' => '',
		'opus' => '', // new file type. not part of mejs, but works anyway
		'poster' => '',
		'width' => $wp_options[ $tag_name . '_width' ],
		'height' => $wp_options[ $tag_name . '_height' ],
		'type' => '',
		'preload' => 'none',
		'autoplay' => '',
		'loop' => '',
		'progress' => 'true',
		'volume' => 'true',
		'fullscreen' => 'true',
		'captions' => '',
		'captionslang' => 'en',
		'alwaysshowhours' => 'true',
		'alwaysshowcontrols' => 'true',

		// Podlove specific additions
		'title' => '',
		'subtitle' => '',
		'summary' => '',
		'permalink' => '',
		'chapters' => '',
		'chapterlinks' => 'all', // could also be 'false' or 'buffered'
		'duration' => 'false',
		'chaptersvisible' => 'false',
		'timecontrolsvisible' => 'false',
		'summaryvisible' => 'false'
	), $atts));

	if ( $type ) {
		$attributes[] = 'type="' . $type . '"';
	} elseif ( $wp_options[$tag_name . '_type'] ) {
		$attributes[] = 'type="' . $wp_options[$tag_name . '_type'] . '"';
	}

	if ( $src ) {
		$src = trim( $src ); 
		// does it have an extension?
		$suffixlength = strlen( substr( $src, strrpos( $src, "." ) ) );
		if ($suffixlength == 4 || $suffixlength == 5) {
			$attributes[] = 'src="' . htmlspecialchars($src) . '"';
		}
	}

	// ------------------- prepare <audio|video> attributes

	if ( $width && $tag_name == 'video' ) {
		$attributes[] = 'width="' . $width . '"';
	}
	if ( $height && $tag_name == 'video' ) {
		$attributes[] = 'height="' . $height . '"';
	}
	if ( $poster && $tag_name == 'video' ) {
		$attributes[] = 'poster="' . htmlspecialchars($poster) . '"';
	}
	if ( $preload ) {
		$attributes[] = 'preload="' . $preload . '"';
	}
	if ( $autoplay ) {
		$attributes[] = 'autoplay="' . $autoplay . '"';
	}
	$attributes_string = !empty($attributes) ? implode(' ', $attributes) : '';


	// ------------------- prepare <source> elements

	if ( $mp4 ) {
		$sources[] = '<source src="' . htmlspecialchars($mp4) . '" type="' . $tag_name . '/mp4" />';
	}
	if ( $webm ) {
		$sources[] = '<source src="' . htmlspecialchars($webm) . "\" type='video/webm; codecs=\"vp8, vorbis\"' />";
	}
	if ( $ogg && $tag_name == "audio" ) {
		$sources[] = '<source src="' . htmlspecialchars($ogg) . "\" type='audio/ogg; codecs=vorbis' />";
	} elseif ( $ogg && $tag_name == "video" ) {
		$sources[] = '<source src="' . htmlspecialchars($ogg) . "\" type='video/ogg; codecs=\"theora, vorbis\"' />";
	}
	if ( $mp3 ) {
		$sources[] = '<source src="' . htmlspecialchars($mp3) . '" type="' . $tag_name . '/mp3" />';
	}
	if ( $opus ) {
		$sources[] = '<source src="' . htmlspecialchars($opus) . "\" type='" . $tag_name . "/ogg; codecs=opus' />";
	}
	if ( $flv ) {
		$sources[] = '<source src="' . htmlspecialchars($flv) . '" type="' . $tag_name . '/flv" />';
	}
	if ( $wmv ) {
		$sources[] = '<source src="' . htmlspecialchars($wmv) . '" type="' . $tag_name . '/wmv" />';
	}
	if ( $captions ) {
		$sources[] = '<track src="' . $captions . '" kind="subtitles" srclang="' . $captionslang . '" />';
	}
	$sources_string = !empty($sources) ? implode("\n\t\t", $sources) : '';
	

	// ------------------- prepare controls/features

	if ( $tag_name == 'video' || ( !$poster && !$title && !$subtitle && !$summary ) ) {
		$features[] = "'playpause'";
	}

	$features[] = "'current'";
	$features[] = "'progress'";
	$features[] = "'duration'";
	$features[] = "'tracks'";
	
	if ( $loop ) {
		$features[] .= "'loop'";
	}
	if ( $fullscreen == 'true' ) {
		$features[] = "'fullscreen'";
	}
	if ( $volume == 'true' ) {
		$features[] = "'volume'";
	}
	$temp[] = 'features: [' . implode(',', $features) . ']';
	$features_string = !empty($temp) ? implode(',', $temp) : '';

	// ------------------- prepare player dimensions
	if ($tag_name == 'audio') {
		$widthunit = 'px';
		if (empty($width) || strtoupper(trim($width)) == "AUTO") {
			$width = 'auto';
			$widthunit = '';
		}
		$heightunit = 'px';
		if (empty($height)) {
			$height = '30';
		}
		$dimensions = 'style="width: ' . $width . $widthunit . '; height: ' . $height . $heightunit . '"';
	} else { // for video
		$dimensions = 'width="' . $width . '" height="' . $height . '"';
	}

	// ------------------- prepare podlove meta info (enriched player)

	$fallback = "";

	// ------------------- prepare podlove call inits

	$init_options = "";
	if ( $poster ) {
		$init_options .= "\n  poster: '" . htmlspecialchars($poster) . "',";
	}
	if ( $title ) {
		$init_options .= "\n  title: '" . htmlspecialchars($title) . "',";
	}
	if ( $permalink ) {
		$init_options .= "\n  permalink: '" . $permalink . "',";
	}
	if ( $subtitle ) {
		$init_options .= "\n  subtitle: '" . htmlspecialchars($subtitle) . "',";
	}
	if ( $chapters ) {
		$init_options .= "\n  chapters: '" . podlovewebplayer_render_chapters( $chapters ) . "',";
	}
	if ( $summary ) {
		$init_options .= "\n  summary: '" . ereg_replace("\r?\n", "'\n".'+"\n"+\'', htmlspecialchars($summary)) . "',";
	}
	if ( $duration ) {
		$init_options .= "\n  duration: '" . $duration . "',";
	}
	if ( $loop ) {
		$init_options .= "\n  loop: " . $loop . ",";
	}
	if ( $tag_name == 'audio' ) {
		$init_options .= "\n  audioWidth: '". $width . "',";
		$init_options .= "\n  audioHeight: '" . $height . "',";
	}
	if ( $alwaysshowhours ) {
		$init_options .= "\n  alwaysShowHours: " . $alwaysshowhours . ",";	
	}
	if ( $alwaysshowcontrols ) {
		$init_options .= "\n  alwaysShowControls: " . $alwaysshowcontrols . ",";	
	}
	if ( $chaptersvisible ) {
		$init_options .= "\n  chaptersVisible: " . $chaptersvisible . ",";	
	}
	if ( $timecontrolsvisible ) {
		$init_options .= "\n  timecontrolsVisible: " . $timecontrolsvisible . ",";	
	}
	if ( $summaryvisible ) {
		$init_options .= "\n  summaryVisible: " . $summaryvisible . ",";	
	}
	if ( !empty( $features_string ) ) {
		$init_options .= "\n  " . $features_string . ",";
	}
	$init_options .= "\n  chapterlinks: '".$chapterlinks."'";


	// ------------------- build actual html player code
	
	$return = <<<_end_
	<{$tag_name} id="podlovewebplayer_{$podlovewebplayer_index}" {$dimensions} controls {$attributes_string}>
		{$sources_string}
		{$fallback}
	</{$tag_name}>
_end_;
	$return .= "\n\n<script>jQuery('#podlovewebplayer_{$podlovewebplayer_index}').podlovewebplayer({{$init_options}});</script>\n";
	$podlovewebplayer_index++;
	return $return;
}


/* Helper functions */

function podlovewebplayer_render_chapters( $input ) {
	global $post;
	$input = trim( $input );
	$chapters = false;
	if ( $input != '' ) {
		if ( 
			substr( $input, 0, 7 ) == 'http://' || 
			substr( $input, 0, 8 ) == 'https://'
		) {
			$chapters = trim( file_get_contents( $input ) );
		} elseif ( $chapters = get_post_custom_values( $input, $post->ID ) ) {
			$chapters = $chapters[0];
		}
	}
	$chapters = ereg_replace("\r?\n", "'\n".'+"\n"+\'', $chapters);
	return $chapters;
}


/* Shortcodes */

function podlovewebplayer_audio_shortcode( $attributes ) {
	return @is_feed() ? '' : podlovewebplayer_render_player( 'audio', $attributes );
}
// [audio] is deprecated
add_shortcode( 'audio', 'podlovewebplayer_audio_shortcode' );
add_shortcode( 'podloveaudio', 'podlovewebplayer_audio_shortcode' );

function podlovewebplayer_video_shortcode( $attributes ) {
	return @is_feed() ? '' : podlovewebplayer_render_player( 'video', $attributes );
}
// [video] is deprecated
add_shortcode( 'video', 'podlovewebplayer_video_shortcode' );
add_shortcode( 'podlovevideo', 'podlovewebplayer_video_shortcode' );


/* Announce deprecation of [audio] and [video] shortcode */

function podlovewebplayer_deprecated_widget_function() {
	echo '<p style="border-top:2px solid red;padding-top:6px;color:#c00">Using the shortcode <code>[audio]</code> and <code>[video]</code> for the Podlove Web Player is <strong>deprecated</strong> and will be dropped.<br /> Use <code>[podloveaudio]</code> and <code>[podlovevideo]</code> instead!</p>';
}
function podlovewebplayer_add_dashboard_widgets() {
	wp_add_dashboard_widget('podlovewebplayer_deprecated_widget', 'Podlove Web Player', 'podlovewebplayer_deprecated_widget_function');
}
add_action('wp_dashboard_setup', 'podlovewebplayer_add_dashboard_widgets' ); // Hint: For Multisite Network Admin Dashboard use wp_network_dashboard_setup instead of wp_dashboard_setup.


/* Auto-detect enclosures */

// modified version of get_enclosed. Returns arrays with meta info instead of plain strings.
function podlovewebplayer_get_enclosed( $post_id ) {
	$custom_fields = get_post_custom( $post_id );
	$pung = array();
	if ( !is_array( $custom_fields ) )
		return $pung;

	foreach ( $custom_fields as $key => $val ) {
		if ( 'enclosure' != $key || !is_array( $val ) )
			continue;
		foreach( $val as $enc ) {
			$pung[] = explode( "\n", $enc );
		}
	}
	$pung = apply_filters( 'get_enclosed', $pung, $post_id );
	return $pung;
}

function podlovewebplayer_enclosures( $content ) {
	global $post;
	$wp_options = get_option('podlovewebplayer_options');
	if ( $enclosures = podlovewebplayer_get_enclosed( $post->ID ) // do we have enclosures in this post?
		AND (
			isset($wp_options['enclosure_force']) // forced to render enclosures by option
			OR 
			( strpos( $content, "[podloveaudio" ) === false AND 
			  strpos( $content, "[podlovevideo" ) === false AND
			  strpos( $content, "[audio" ) === false AND 
			  strpos( $content, "[video" ) === false ) // there is no manual shortcode
		)
	) 
	{
		foreach( $enclosures as $enclosure ) {
			$type = substr( $enclosure[2], 0, strpos( $enclosure[2], "/" ) );
			$duration = "";
			if ( isset( $enclosure[3] ) && $enc3_array = unserialize( $enclosure[3] ) ) {
				if ( isset( $enc3_array['duration'] ) ) {
					$duration = "duration='" . $enc3_array['duration'] . "'";
				}
			}
			$title = "";
			if ( isset( $wp_options['enclosure_richplayer'] ) ) {
				$title = 'title="'.$post->post_title.'"';
			}
			$shortcode = '[podlove'.$type.' '.$title.' type="'.$enclosure[2].'" src="'.$enclosure[0].'" '.$duration.']';
			$pwpcode = do_shortcode( $shortcode );
			if ( isset( $wp_options['enclosure_bottom'] ) ) {
				$content = $content . $pwpcode;
			} else {
				$content = $pwpcode . $content;
			}
		}
	}
	return $content;
}


$wp_options = get_option('podlovewebplayer_options');
if( !@is_feed() && isset( $wp_options['enclosure_detect'] ) ) {
	// fire auto-detect script before regular shortcode, which has prio 11
	add_filter( 'the_content', 'podlovewebplayer_enclosures', 10 );
}


/* Initialisation */

function podlovewebplayer_init() {
	wp_enqueue_script('jquery');
}
add_action('init', 'podlovewebplayer_init');


} // End of code

?>