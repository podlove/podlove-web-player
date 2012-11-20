<?php
/**
 * @package PodloveWebPlayer
 * @version 1.2
 */

/*
Plugin Name: Podlove Web Player
Plugin URI: http://podlove.org/podlove-web-player/
Description: Video and audio plugin for WordPress built on the MediaElement.js HTML5 media player library.
Author: Gerrit van Aaken and others
Version: 1.2
Author URI: http://praegnanz.de
License: GPLv3, MIT
*/

/*  Copyright 2012  Gerrit van Aaken  (email : gerrit@praegnanz.de)

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
*/
    

/*
Forked from: http://mediaelementjs.com/ plugin
which was adapted from: http://videojs.com/ plugin
*/





/* Prevent conflicts with already running versions of PWP */

if (!function_exists('podlove_pwp_install')) {

$podlovePlayerIndex = 1;

define('PODLOVEWEBPLAYER_DIR', plugin_dir_url(__FILE__));
define('PODLOVEWEBPLAYER_PATH', plugin_dir_path(__FILE__));
define('PODLOVEWEBPLAYER_MEJS_DIR', PODLOVEWEBPLAYER_DIR . 'mediaelement/');

/* Runs when plugin is activated */


function podlove_pwp_install() {
	add_option('pwp_video_skin', '');
	add_option('pwp_script_on_demand', false);

	add_option('pwp_default_video_height', 270);
	add_option('pwp_default_video_width', 480);
	add_option('pwp_default_video_type', '');

	add_option('pwp_default_audio_height', 30);
	add_option('pwp_default_audio_width', 400);
	add_option('pwp_default_audio_type', '');
}

register_activation_hook(__FILE__, 'podlove_pwp_install');

/* Runs on plugin deactivation */

function podlove_pwp_remove() {
	delete_option('pwp_video_skin');
	delete_option('pwp_script_on_demand');

	delete_option('pwp_default_video_height');
	delete_option('pwp_default_video_width');
	delete_option('pwp_default_video_type');

	delete_option('pwp_default_audio_height');
	delete_option('pwp_default_audio_width');
	delete_option('pwp_default_audio_type');
}

register_deactivation_hook(__FILE__, 'podlove_pwp_remove');

/* create custom plugin settings menu */

include_once(PODLOVEWEBPLAYER_PATH . 'settings.php');

function podlove_pwp_create_menu() {
	// create new top-level menu
	add_options_page('Podlove Web Player Options', 'Podlove Web Player', 'administrator', __FILE__, 'podlove_pwp_settings_page');

	// call register settings function
	add_action('admin_init', 'podlove_pwp_register_settings');
}

add_action('admin_menu', 'podlove_pwp_create_menu');


function podlove_pwp_register_settings() {
	//register our settings
	register_setting('pwp_settings', 'pwp_video_skin');
	register_setting('pwp_settings', 'pwp_script_on_demand');

	register_setting('pwp_settings', 'pwp_default_video_height');
	register_setting('pwp_settings', 'pwp_default_video_width');
	register_setting('pwp_settings', 'pwp_default_video_type');

	register_setting('pwp_settings', 'pwp_default_audio_height');
	register_setting('pwp_settings', 'pwp_default_audio_width');
	register_setting('pwp_settings', 'pwp_default_audio_type');
}


// Javascript

// This is now handled by calling wp_enqueue_script inside the pwp_media_shortcode function by default. This means that MediaElement.js's JavaScript will only be called as needed
if (!get_option('pwp_script_on_demand')) {
	function podlove_pwp_add_scripts() {
		if (!is_admin()) {
			// the scripts
			wp_enqueue_script('mediaelementjs-scripts', PODLOVEWEBPLAYER_MEJS_DIR . 'mediaelement-and-player.min.js', array('jquery'), '2.9.1', false);
			wp_enqueue_script('ba-hashchange', PODLOVEWEBPLAYER_DIR . 'libs/jquery.ba-hashchange.min.js', array('jquery'), '1.3.0', false);
			wp_enqueue_script('podlove-web-player', PODLOVEWEBPLAYER_DIR . 'podlove-web-player.js', array('jquery', 'mediaelementjs-scripts'), '1.2', false);
		}
	}
	add_action('wp_print_scripts', 'podlove_pwp_add_scripts');
}

// CSS
// still always enqueued so it happens in the <head> tag
function podlove_pwp_add_styles() {
	if (!is_admin()) {
		// the style
		wp_enqueue_style('mediaelementjs-styles', PODLOVEWEBPLAYER_MEJS_DIR . 'mediaelementplayer.css');
		wp_enqueue_style('podlovewebplayer-styles', PODLOVEWEBPLAYER_DIR . 'podlove-web-player.css');

		if (get_option('pwp_video_skin') != '') {
			wp_enqueue_style('mediaelementjs-skins', PODLOVEWEBPLAYER_MEJS_DIR . 'mejs-skins.css');
		}
	}
}
add_action('wp_print_styles', 'podlove_pwp_add_styles');


function podlove_pwp_media_shortcode($tagName, $atts) {
	// only enqueue when needed
	if (get_option('pwp_script_on_demand')) {
		wp_enqueue_script('mediaelementjs-scripts', PODLOVEWEBPLAYER_MEJS_DIR . 'mediaelement-and-player.min.js', array('jquery'), '2.9.1', false);
	}

	global $podlovePlayerIndex;

	$attributes = array();
	$sources = array();
	$options = array();
	$flash_src = '';

	extract(shortcode_atts(array(
		'src' => '',
		'mp4' => '',
		'mp3' => '',
		'wmv' => '',
		'webm' => '',
		'flv' => '',
		'ogg' => '',
		'opus' => '',
		'poster' => '',
		'width' => get_option('pwp_default_' . $tagName . '_width'),
		'height' => get_option('pwp_default_' . $tagName . '_height'),
		'type' => '',
		'preload' => 'none',
		'skin' => get_option('pwp_video_skin'),
		'autoplay' => '',
		'loop' => '',

		// podlove meta info
		'title' => '',
		'subtitle' => '',
		'summary' => '',
		'permalink' => '',

		// old ones
		'duration' => 'true',
		'progress' => 'true',
		'fullscreen' => 'true',
		'volume' => 'true',

		// captions
		'captions' => '',
		'captionslang' => 'en',

		// chapters
		'chapters' => '',
		'chapterlinks' => 'all' // could also be 'false' or 'buffered'

	), $atts));

	if ($type) {
		$attributes[] = 'type="' . $type . '"';
	} elseif (get_option('pwp_default_' . $tagName . '_type')) {
		$attributes[] = 'type="' . get_option('pwp_default_' . $tagName . '_type').'"';
	}

	if ($src) {
		$src = trim($src); 
		// does it have an extension?
		$suffixlength = strlen(substr($src, strrpos($src, ".")));
		if ($suffixlength == 4 || $suffixlength == 5) {
			$attributes[] = 'src="' . htmlspecialchars($src) . '"';
			$flash_src = htmlspecialchars($src);
		}
	}

	// <source> tags

	if ($mp4) {
		$sources[] = '<source src="' . htmlspecialchars($mp4) . '" type="' . $tagName . '/mp4" />';
		$flash_src = htmlspecialchars($mp4);
	}
	if ($webm) {
		$sources[] = '<source src="' . htmlspecialchars($webm) . "\" type='video/webm; codecs=\"vp8, vorbis\"' />";
	}
	if ($ogg && $tagName == "audio") {
		$sources[] = '<source src="' . htmlspecialchars($ogg) . "\" type='audio/ogg; codecs=vorbis' />";
	} elseif ($ogg && $tagName == "video") {
		$sources[] = '<source src="' . htmlspecialchars($ogg) . "\" type='video/ogg; codecs=\"theora, vorbis\"' />";
	}
	if ($mp3) {
		$sources[] = '<source src="' . htmlspecialchars($mp3) . '" type="' . $tagName . '/mp3" />';
		$flash_src = htmlspecialchars($mp3);
	}
	if ($opus) {
		$sources[] = '<source src="' . htmlspecialchars($opus) . "\" type='" . $tagName . "/ogg; codecs=opus' />";
	}
	if ($flv) {
		$sources[] = '<source src="' . htmlspecialchars($flv) . '" type="' . $tagName . '/flv" />';
	}
	if ($wmv) {
		$sources[] = '<source src="' . htmlspecialchars($wmv) . '" type="' . $tagName . '/wmv" />';
	}
	if ($captions) {
		$sources[] = '<track src="' . $captions . '" kind="subtitles" srclang="' . $captionslang . '" />';
	}

	// <audio|video> attributes
	if ($width && $tagName == 'video') {
		$attributes[] = 'width="' . $width . '"';
	}
	if ($height && $tagName == 'video') {
		$attributes[] = 'height="' . $height . '"';
	}
	if ($poster && $tagName == 'video') {
		$attributes[] = 'poster="' . htmlspecialchars($poster) . '"';
	}

	if ($preload) {
		$attributes[] = 'preload="' . $preload . '"';
	}
	if ($autoplay) {
		$attributes[] = 'autoplay="' . $autoplay . '"';
	}

	// MEJS JavaScript options
	if ($loop) {
		$options[]  = 'loop: ' . $loop;
	}

	// CONTROLS array
	if ($tagName == 'video' || (!$poster && !$title && !$subtitle && !$summary)) {
		$controls_option[] = '"playpause"';
	}
	if ($progress == 'true') {
		$controls_option[] = '"current"';
		$controls_option[] = '"progress"';
	}
	if ($duration == 'true') {
		$controls_option[] = '"duration"';
	}
	if ($volume == 'true') {
		$controls_option[] = '"volume"';
	}
	$controls_option[] = '"tracks"';
	if ($fullscreen == 'true') {
		$controls_option[] = '"fullscreen"';
	}

	$options[] = '"features":[' . implode(',', $controls_option) . ']';

	// <audio> size
	if ($tagName == 'audio') {
		$options[] = '"audioWidth":' . $width;
		$options[] = '"audioHeight":' . $height;
	}

	// <video> class (skin)
	$skin_class = '';
	if ($skin != '') {
		$skin_class  = 'mejs-' . $skin;
	}

	//prepare player embed string
	$attributes_string = !empty($attributes) ? implode(' ', $attributes) : '';
	$sources_string = !empty($sources) ? implode("\n\t\t", $sources) : '';
	$options_string = !empty($options) ? '{' . implode(',', $options) . '}' : '';
	$options_string = str_replace('"', '\'', $options_string);

	//prepare player dimensions
	if ($tagName == 'audio') {
		$widthunit = 'px';
		if (empty($width)) {
			$width = 'auto';
			$widthunit = '';
		}
		$heightunit = 'px';
		if (empty($height)) {
			$height = '30';
		}
		$dimensions = 'style="width: ' . $width . $widthunit . '; height: ' . $height . $heightunit . '"';
	} else {
		$dimensions = 'width="' . $width . '" height="' . $height . '"';
	}

	//prepare podlove meta info (enriched player)
	$podloveMeta = "";
	if ($tagName == 'audio' && ($poster || $title || $subtitle || $summary)) {
		$podloveMeta .= '<div class="podlovemeta">';

		$podloveMeta .= '<a class="bigplay" href="#">Play Episode</a>';
		if ($poster) {
			$podloveMeta .= '<div class="coverart"><img src="'.htmlspecialchars($poster).'" alt=""/></div>';
		}
		if ($title) {
			$podloveMeta .= '<h3>'.$title.'</h3>';
		}
		if ($subtitle) {
			$podloveMeta .= '<div class="subtitle">'.$subtitle.'</div>';
		}
		if ($summary) {
			$podloveMeta .= '<a href="#" class="infowindow" title="more information on the episode">info</a>';
		}
		$podloveMeta .= '</div>';
		if ($summary) {
			$podloveMeta .= '<div class="summary">'.$summary.'</div>';
		}
	}

	//build actual html player code
	
		$mediahtml = <<<_end_

		<div class="mediaelementjs_player_container">
		{$podloveMeta}

	<{$tagName} id="wp_pwp_{$podlovePlayerIndex}" {$dimensions} controls {$attributes_string} class="{$skin_class}" data-mejsoptions="{$options_string}">
		{$sources_string}
	</{$tagName}>
_end_;

	// Chapters Table and Behaviour
	if ($chapters) {
		if ($chaptertable = podlove_pwp_render_chapters($chapterlinks, $chapters)) {
			$mediahtml .= "\n\n" . $chaptertable;
		}
	}
	$mediahtml .= "\n\n</div>\n\n<script>jQuery(function() { PODLOVE.web_player('wp_pwp_{$podlovePlayerIndex}'); });</script>\n";

	$podlovePlayerIndex++;
	return $mediahtml;
}


function podlove_pwp_render_chapters($link_chapters, $custom_field) {
	global $post;
	global $podlovePlayerIndex;
	$custom_field = trim($custom_field);

	if ($custom_field != '') {
		if (substr($custom_field, 0, 7) == 'http://'
			|| substr($custom_field, 0, 8) == 'https://') {
			$chapters[0] = trim(file_get_contents($custom_field));
		} else {
			$chapters = get_post_custom_values($custom_field, $post->ID);
		}

		if ($chapters && $chapters = podlove_pwp_chapters_from_string($chapters[0])) {
			$class_names = 'pwp_chapters';
			if ($link_chapters == 'all' || $link_chapters == 'buffered') {
				$class_names .= ' linked linked_'.$link_chapters;
			}

			$output = '<table rel="wp_pwp_' . $podlovePlayerIndex . '" class="' . $class_names . '">';
			$output .= '<caption>Podcast Chapters</caption>';
			$output .= '<thead><tr>';
			if ($link_chapters != 'false') {
				$output .= '<th scope="col">Play</th>';
			}
			$output .= '<th scope="col">Title</th><th scope="col">Duration</th></tr></thead>';
			$output .= '<tbody>';
			foreach ($chapters as $i => $chapter) {

				// prepare data
				$is_final_chapter = $i == count($chapters) - 1;
				if ($is_final_chapter) {
					$chapterduration = "0";
					$end = '99999999';
				} else {
					$chapterduration = (int) $chapters[$i + 1]['timecode'] -  (int) $chapter['timecode'];
					$end = $chapters[$i + 1]['timecode'];
				}
				$chapterduration = podlove_pwp_sec2timecode($chapterduration);
				$deeplink = get_permalink();

				
				// deeplink, start and end
				$deeplink_singlechapter = '#t=' . $chapter['human_timecode'] .
					(!$is_final_chapter ? ',' . $chapters[$i + 1]['human_timecode'] : '');
				if (!is_singular()) {
					$deeplink_singlechapter = get_permalink().$deeplink_singlechapter;
				}

				// render html
				$output .= '<tr data-start="' . $chapter['timecode'] . '" data-end="' . $end . '">';
				if ($link_chapters != 'false') {
					$linkclass = "";
					if ($link_chapters != 'all') { $linkclass = ' class="disabled"'; }
					$output .= '<td class="chapterplay">';
					$output .= '<a rel="player" title="play chapter" data-start="' . $deeplink . '"' . $linkclass . '><span>»</span></a>';
					$output .= '</td>';
				}
				$output .= '<td class="title">' . $chapter['title'] . '</td>'."\n";
				$output .= '<td class="timecode">'."\n";
				$output .= '<code>' . $chapterduration.'</code>'."\n";
				$output .= '<a class="deeplink" href="'.$deeplink_singlechapter.'" title="chapter deeplink">#</a> '."\n";
				$output .= '</td>'."\n";
				$output .= '</tr>';
			}
			$output .= '</tbody></table>';
			return $output;
		}
	}
	return false;
}

function podlove_pwp_sec2timecode($secs) {
	if (!$secs) {
		return "";
	} elseif ($secs < 60) {
		return "00:".podlove_pwp_twodigits($secs);
	} elseif ($secs < 3600) {
		$mins = floor($secs/60);
		$rest = $secs - (60 * $mins);
		return podlove_pwp_twodigits($mins) . ":" . podlove_pwp_twodigits($rest);
	} else {
		$hours = floor($secs/3600);
		$rest = $secs - (3600 * $hours);
		$mins = floor($rest/60);
		$rest = $rest - (60 * $mins);
		return $hours .":". podlove_pwp_twodigits($mins) . ":" . podlove_pwp_twodigits($rest);
	}
}

function podlove_pwp_twodigits($number) {
	if ($number < 10) {
		return "0".$number;
	} else {
		return $number;
	}
}

function podlove_pwp_chapters_from_string($chapstring) {
	$lines = explode("\n", $chapstring);
	$chapters = array();

	foreach ($lines as $i => $line) {
		if (trim($line) != '') {
			$line = trim(str_replace("\n", '', $line));
			$div = stripos($line, ' ');

			$time = trim(substr($line, 0, $div));
			$hours = substr($time, 0, 2);
			$minutes = substr($time, 3, 2);
			$seconds = substr($time, 6, 2);
			$milliseconds = count(substr($time, 9, 1)) ? substr($time, 9, 3) : 0;
			$timecode = ($seconds + $minutes * 60 + $hours * 3600) .
					'.' . floor($milliseconds);

			$chapters[$i] = array(
				'title' => trim(substr($line, $div + 1)),
				'human_timecode' => substr($time, 0, 8),
				'timecode' => $timecode,
				'hours' => $hours,
				'minutes' => $minutes,
				'seconds' => $seconds,
				'milliseconds' => $milliseconds
			);
		}
	}

	// human readable timecodes - only leave hours if necessary
	if ($chapters[$i]['hours'] == '00') {
		foreach ($chapters as $i => $chapter) {
			$chapters[$i]['human_timecode'] = substr($chapter['human_timecode'], 3);
		}
	}

	return count($chapters) > 0 ? $chapters : false;
}


/* Shortcodes */

function podlove_pwp_audio_shortcode($attributes) {
	return is_feed() ? '' : podlove_pwp_media_shortcode('audio', $attributes);
}

// [audio] is deprecated
add_shortcode('audio', 'podlove_pwp_audio_shortcode');
add_shortcode('podloveaudio', 'podlove_pwp_audio_shortcode');

function podlove_pwp_video_shortcode($attributes) {
	return is_feed() ? '' : podlove_pwp_media_shortcode('video', $attributes);
}

// [video] is deprecated
add_shortcode('video', 'podlove_pwp_video_shortcode');
add_shortcode('podlovevideo', 'podlove_pwp_video_shortcode');

/* Announce deprecation of [audio] and [video] shortcode */

function podlove_pwp_deprecated_widget_function() {
	echo '<p style="border-top:2px solid red;padding-top:6px;color:#c00">Using the shortcode <code>[audio]</code> and <code>[video]</code> for the Podlove Web Player is <strong>deprecated</strong> and will be dropped.<br /> Use <code>[podloveaudio]</code> and <code>[podlovevideo]</code> instead!</p>';
}
function podlove_pwp_add_dashboard_widgets() {
	wp_add_dashboard_widget('podlove_pwp_deprecated_widget', 'Podlove Web Player', 'podlove_pwp_deprecated_widget_function');
}
add_action('wp_dashboard_setup', 'podlove_pwp_add_dashboard_widgets' ); // Hint: For Multisite Network Admin Dashboard use wp_network_dashboard_setup instead of wp_dashboard_setup.


/* Auto-detect enclosures */


// modified version of get_enclosed. Returns arrays with meta info instead of plain strings.
function podlove_pwp_get_enclosed($post_id) {
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
	$pung = apply_filters('get_enclosed', $pung, $post_id);
	return $pung;
}

function podlove_pwp_enclosure($content) {
	global $post;

	if ($enclosures = podlove_pwp_get_enclosed($post->ID) // do we have enclosures in this post?
		AND (
			get_option('pwp_enclosure_force') == true) // forced to render enclosures by option
			OR 
		 	(!strpos($content, "[podloveaudio") AND 
		 	 !strpos($content, "[podlovevideo") AND
		 	 !strpos($content, "[audio") AND 
		 	 !strpos($content, "[video")) // there is no manual shortcode
		) 
	{
		foreach($enclosures as $enclosure) {
			$type = substr($enclosure[2], 0, strpos($enclosure[2], "/"));
			$pwpcode = do_shortcode('[podlove'.$type.' type="'.$enclosure[2].'" src="'.$enclosure[0].'"]');
			if (get_option('pwp_enclosure_bottom') == true) {
				$content = $content.$pwpcode;
			} else {
				$content = $pwpcode.$content;
			}
		}
	}
	return $content;
}

function podlove_pwp_auto_detect_enclosures() {
	if( !is_feed() && get_option('pwp_enclosure_detect') == true) {
		// fire auto-detect script before regular shortcode, which has prio 11
		add_filter('the_content', 'podlove_pwp_enclosure', 10);
	}	
}
add_action( 'wp', 'podlove_pwp_auto_detect_enclosures' );

/* Initialisation */

function podlove_pwp_init() {
	wp_enqueue_script('jquery');
}

add_action('init', 'podlove_pwp_init');

} // End of code

?>
