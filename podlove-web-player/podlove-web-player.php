<?php
/**
 * @package PodloveWebPlayer
 * @version 1.1.2
 */

/*
Plugin Name: Podlove Web Player
Plugin URI: http://podlove.org/podlove-web-player/
Description: Video and audio plugin for WordPress built on the MediaElement.js HTML5 media player library.
Author: Gerrit van Aaken and others
Version: 1.1.2
Author URI: http://praegnanz.de
License: GPLv3, MIT
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
			wp_enqueue_script('podlove-web-player', PODLOVEWEBPLAYER_DIR . 'podlove-web-player.js', array('jquery', 'mediaelementjs-scripts'), '1.1.2', false);
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
		'poster' => '',
		'width' => get_option('pwp_default_' . $tagName . '_width'),
		'height' => get_option('pwp_default_' . $tagName . '_height'),
		'type' => get_option('pwp_default_' . $tagName . '_type'),
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
		'chapterlinks' => 'all'

	), $atts));

	if ($type) {
		$attributes[] = 'type="' . $type . '"';
	}

/*
	if ($src) {
		$attributes[] = 'src="'.htmlspecialchars($src).'"';
		$flash_src = htmlspecialchars($src);
	}
*/

	if ($src) {

		// does it have an extension?
		if (substr($src, strlen($src) - 4, 1) == '.') {
			$attributes[] = 'src="' . htmlspecialchars($src) . '"';
			$flash_src = htmlspecialchars($src);
		}
	}

	// <source> tags
	if ($mp4) {
		$sources[] = '<source src="' . htmlspecialchars($mp4) . '" type="' . $tagName . '/mp4" />';
		$flash_src = htmlspecialchars($mp4);
	}
	if ($mp3) {
		$sources[] = '<source src="' . htmlspecialchars($mp3) . '" type="' . $tagName . '/mp3" />';
		$flash_src = htmlspecialchars($mp3);
	}
	if ($webm) {
		$sources[] = '<source src="' . htmlspecialchars($webm) . '" type="' . $tagName . '/webm" />';
	}
	if ($ogg) {
		$sources[] = '<source src="' . htmlspecialchars($ogg) . '" type="' . $tagName . '/ogg" />';
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

	//prepare podlove meta info
	$podloveMeta = "";
	if ($tagName == 'audio' && ($poster || $title || $subtitle || $summary)) {
		$podloveMeta .= '<div class="podlovemeta">';

		$podloveMeta .= '<a class="bigplay" href="">Play Episode</a>';
		if ($poster) {
			$podloveMeta .= '<div class="coverart"><img src="'.htmlspecialchars($poster).'" alt=""/></div>';
		}
		if ($title) {
			$podloveMeta .= '<h3>'.$title.'</h3>';
		}
		if ($subtitle) {
			$podloveMeta .= '<div class="subtitle"><strong>'.$subtitle.'</strong></div>';
		}
		if ($summary) {
			$podloveMeta .= '<div class="summary">'.$summary.'</div>';
		}
		$podloveMeta .= '</div>';
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
				$class_names .= ' linked';
			}

			$output = '<table rel="wp_pwp_' . $podlovePlayerIndex . '" class="' . $class_names . '">';
			$output .= '<caption>Podcast Chapters</caption>';
			$output .= '<thead><tr><th scope="col">Timecode</th><th scope="col">Title</th></tr></thead>';
			$output .= '<tbody>';
			foreach ($chapters as $i => $chapter) {
				$is_final_chapter = $i == count($chapters) - 1;

				$end = $is_final_chapter ? '9999999' : $chapters[$i + 1]['timecode'];
				$output .= '<tr data-start="' . $chapter['timecode'] . '" data-end="' . $end . '">';

				$output .= '<td class="timecode"><code>' . $chapter['human_timecode'] . '</code></td>';
				if ($link_chapters == 'all') {
					$deeplink = get_permalink();
					$deeplink .= '#t=' . $chapter['human_timecode'] .
							(!$is_final_chapter ? ',' . $chapters[$i + 1]['human_timecode'] : '');
					$output .= '<td class="title"><a href="' . $deeplink . '">' . $chapter['title'] . '</a></td>';
				} else {
					$output .= '<td class="title">' . $chapter['title'] . '</td>';
				}
				$output .= '</tr>';
			}
			$output .= '</tbody></table>';
			return $output;
		}
	}
	return false;
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
	echo '<p style="border-top:2px solid red;padding-top:6px;color:#c00">Using the shortcode <code>[audio]</code> and <code>[video]</code> for the Podlove Web Player is <strong>deprecated</strong> and will be dropped.<br /> Use <code>[podloveaudio]</code> and <code>[podlovevideo]</code> insted!</p>';
}
function podlove_pwp_add_dashboard_widgets() {
	wp_add_dashboard_widget('podlove_pwp_deprecated_widget', 'Podlove Web Player', 'podlove_pwp_deprecated_widget_function');
}
add_action('wp_dashboard_setup', 'podlove_pwp_add_dashboard_widgets' ); // Hint: For Multisite Network Admin Dashboard use wp_network_dashboard_setup instead of wp_dashboard_setup.

/* Initialisation */

function podlove_pwp_init() {
	wp_enqueue_script('jquery');
}

add_action('init', 'podlove_pwp_init');

} // End of code

?>
