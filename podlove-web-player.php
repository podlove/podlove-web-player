<?php
/**
 * @package PodloveWebPlayer
 * @version 2.0.18
 */

/*
Plugin Name: Podlove Web Player
Plugin URI: http://podlove.org/podlove-web-player/
Description: Video and audio plugin for WordPress built on the MediaElement.js HTML5 media player library.
Version: 2.0.18
Author: Podlove Team
Author URI: http://podlove.org/
License: BSD 2-Clause License
License URI: http://opensource.org/licenses/BSD-2-Clause

Copyright (c) 2013, Podlove.org
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/




// Prevent conflicts with already running versions of PWP
if (!function_exists( 'podlovewebplayer_install' ) && !function_exists( 'podlove_pwp_install' )) {

// Prevent Header Errors by Error and Warnings output
ob_start();

/* global-ish init variables */
$podlovewebplayer_index = 1;
define( 'PODLOVEWEBPLAYER_DIR', plugin_dir_path( __FILE__ ) );
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
include_once( PODLOVEWEBPLAYER_DIR . 'settings.php' );

/* embed javascript files */

function podlovewebplayer_add_scripts() {
	wp_enqueue_script( 
		'ba_hashchange', 
		plugins_url('static/hashchange.min.js', __FILE__), 
		array(), '1.3.0', false
	);
	wp_enqueue_script( 
		'podlovewebplayer', 
		plugins_url('static/podlove-web-player.js', __FILE__), 
		array(), '2.0.18', false
	);
}
add_action('wp_print_scripts', 'podlovewebplayer_add_scripts');



/* embed css files */

function podlovewebplayer_add_styles() {
	global $blog_id;
	$wp_options = get_option('podlovewebplayer_options');
	wp_enqueue_style( 'pwpfont', plugins_url('static/podlove-web-player.css', __FILE__), array(), '2.0.18' );
}
add_action( 'wp_print_styles', 'podlovewebplayer_add_styles' );

function podlovewebplayer_get_supported_sources( $tag_name ) {
	return array(
		'mp4'  => $tag_name . '/mp4',
		'webm' => 'video/webm; codecs="vp8, vorbis"',
		'ogg'  => sprintf( '%s/ogg; codecs="%s"', $tag_name, ( $tag_name == 'video' ) ? 'theora, vorbis' : 'vorbis' ),
		'mp3'  => $tag_name . '/mpeg',
		'opus' => $tag_name . '/ogg; codecs=opus',
		'flv'  => $tag_name . '/flv',
		'wmv'  => $tag_name . '/wmv',
	);
}

/* ---------------------------------------- render player on shortcode */

function podlovewebplayer_render_player( $tag_name, $atts ) {

	global $podlovewebplayer_index;
	$attributes = array();
	$sources    = array();
	$files      = array();
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
		'width' => @$wp_options[ $tag_name . '_width' ],
		'height' => @$wp_options[ $tag_name . '_height' ],
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
		'chapterHeight' => 'false',
		'chaptersvisible' => 'false',
		'timecontrolsvisible' => 'false',
		'summaryvisible' => 'false'
	), $atts));

	if ( $type ) {
		$type = strtolower( $type );
		$attributes[] = 'type="' . $type . '"';
	} elseif ( @$wp_options[$tag_name . '_type'] ) {
		$attributes[] = 'type="' . $wp_options[$tag_name . '_type'] . '"';
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
	

	$supported_sources = podlovewebplayer_get_supported_sources( $tag_name );
	$supported_mime_types = array_flip( $supported_sources );

	// try to avoid src="" attribute by determining the actual type
	if ( $src && $type && isset( $supported_mime_types[ $type ] ) ) {
		${$supported_mime_types[ $type ]} = $src;
		$src = false;
	}

	if ( $src ) {
		$src = trim( $src ); 
		// does it have an extension?
		$suffixlength = strlen( substr( $src, strrpos( $src, "." ) ) );
		if ($suffixlength == 4 || $suffixlength == 5) {
			$attributes[] = 'src="' . htmlspecialchars($src) . '"';
		}
	}
	$attributes_string = !empty($attributes) ? implode(' ', $attributes) : '';
	
	// ------------------- prepare <source> elements
	$mp3source = '';
	foreach ( $supported_sources as $source_extension => $source_type ) {
		if ( ${$source_extension} ) {
			$src       = htmlspecialchars( ${$source_extension} );
			$sources[] = '<source src="' . $src . '" type=\'' . $source_type . '\' />';
			$files[]   = $src;
			if ($source_type == 'audio/mpeg') {
				$mp3source = 'src="'.$src.'" type="'.$source_type.'" preload="none"';
				$sources[] = '<object type="application/x-shockwave-flash" data="flashmediaelement.swf">
					<param name="movie" value="flashmediaelement.swf" />
					<param name="flashvars" value="controls=true&file=' . $src . '" />
				</object>';
			}
		}
	}

	if ( $captions ) {
		$sources[] = '<track src="' . $captions . '" kind="subtitles" srclang="' . $captionslang . '" />';
	}

	$sources_string = !empty($sources) ? implode("\n\t\t", $sources) : '';

	// ------------------- prepare controls/features

	$features = array( "current", "progress", "duration", "tracks" );

	if ( $tag_name == 'video' || ( !$poster && !$title && !$subtitle && !$summary ) ) {
		$features[] = "playpause";
	}
	if ( $loop ) {
		$features[] .= "loop";
	}
	if ( $fullscreen == 'true' ) {
		$features[] = "fullscreen";
	}
	if ( $volume == 'true' ) {
		$features[] = "volume";
	}

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

	$truthy = array( true, 'true', 'on', 1, "1" );

	$init_options = array(
		'pluginPath'          => plugins_url( 'static/', __FILE__),
		'alwaysShowHours'     => in_array( $alwaysshowhours, $truthy, true ),
		'alwaysShowControls'  => in_array( $alwaysshowcontrols, $truthy, true ),
		'chaptersVisible'     => in_array( $chaptersvisible, $truthy, true ),
		'timecontrolsVisible' => in_array( $timecontrolsvisible, $truthy, true ),
		'summaryVisible'      => in_array( $summaryvisible, $truthy, true ),
		'hidetimebutton'      => in_array( @$wp_options['buttons_time'], $truthy, true ),
		'hidedownloadbutton'  => in_array( @$wp_options['buttons_download'], $truthy, true ),
		'hidesharebutton'     => in_array( @$wp_options['buttons_share'], $truthy, true ),
		'sharewholeepisode'   => in_array( @$wp_options['buttons_sharemode'], $truthy, true ),
		'loop'                => in_array( $loop, $truthy, true ),
		'chapterHeight'       => @$wp_options['chapter_height'],
		'chapterlinks'        => $chapterlinks
	);

	if ( $poster ) {
		$init_options['poster'] = htmlspecialchars( $poster, ENT_QUOTES );
	}
	if ( $title ) {
		$init_options['title'] = $title;
	}
	if ( $permalink && ( filter_var( $permalink, FILTER_VALIDATE_URL ) !== FALSE ) ) {
		$init_options['permalink'] = $permalink;
	} else {
		$init_options['permalink'] = get_permalink();
	}
	if ( $subtitle ) {
		$init_options['subtitle'] = $subtitle;
	}
	if ( $chapters ) {
		$init_options['chapters'] = podlovewebplayer_render_chapters( $chapters );
		if (( $init_options['chapters'] == false )||( $init_options['chapters'] == '' )) {
			unset($init_options['chapters']);
		}
	}
	if ( $summary ) {
		$init_options['summary'] = nl2br( $summary );
	}
	if ( $duration ) {
		$init_options['duration'] = $duration;
	}
	if ( $tag_name == 'audio' ) {
		$init_options['audioWidth'] = $width;
		$init_options['audioHeight'] = $height;
	}
	if ( count( $features ) ) {
		$init_options['features'] = $features;
	}

	// ------------------- build actual html player code
	$return = "<{$tag_name} id=\"podlovewebplayer_{$podlovewebplayer_index}\" {$dimensions} controls {$attributes_string} {$mp3source}>
		{$sources_string}
		{$fallback}
	</{$tag_name}>";
	$return .= "\n\n<script>jQuery('#podlovewebplayer_{$podlovewebplayer_index}').podlovewebplayer(" . json_encode( $init_options ) . ");</script>\n";
	$podlovewebplayer_index++;
	return $return;
}

/* Helper functions */

function podlovewebplayer_render_chapters( $input ) {
	global $post;
	if ( json_decode($input) === null ) {
		$input = trim( $input );
		$chapters = false;
		if ( $input != '' ) {
			if ( substr( $input, 0, 7 ) == 'http://' || substr( $input, 0, 8 ) == 'https://') {
				$http_context = stream_context_create();
				stream_context_set_params($http_context, array('user_agent' => 'UserAgent/1.0'));
				$chapters = trim( @file_get_contents( $input, 0, $http_context ) );
				$json_chapters = json_decode($chapters);
				if($json_chapters !== null) {
					return $json_chapters;
				}
			} elseif ( $chapters = get_post_custom_values( $input, $post->ID ) ) {
				$chapters = trim( $chapters[0] );
				$json_chapters = json_decode($chapters);
				if($json_chapters !== null) {
					return $json_chapters;
				}
			}
		}
		if ( $chapters == '' ) {
			return '';
		}
		preg_match_all('/((\d+:)?(\d\d?):(\d\d?)(?:\.(\d+))?) ([^<>\r\n]{3,}) ?(<([^<>\r\n]*)>\s*(<([^<>\r\n]*)>\s*)?)?\r?/', $chapters, $chapterArrayTemp, PREG_SET_ORDER);
		$chaptercount = count($chapterArrayTemp);
		for($i = 0; $i < $chaptercount; ++$i) {
			$chapterArray[$i]['start'] = $chapterArrayTemp[$i][1];
			$chapterArray[$i]['title'] = htmlspecialchars($chapterArrayTemp[$i][6], ENT_QUOTES);
			if (isset($chapterArrayTemp[$i][9])) {
				$chapterArray[$i]['image'] = trim($chapterArrayTemp[$i][10], '<> ()\'');
			}
			if (isset($chapterArrayTemp[$i][7])) {
				$chapterArray[$i]['href'] = trim($chapterArrayTemp[$i][8], '<> ()\'');
			}
		}
		return $chapterArray;
	}
	return $input;
}

/* Shortcodes */

function podlovewebplayer_audio_shortcode( $attributes ) {
	return @is_feed() ? '' : podlovewebplayer_render_player( 'audio', $attributes );
}

// [audio] is deprecated
add_shortcode( 'podloveaudio', 'podlovewebplayer_audio_shortcode' );

function podlovewebplayer_video_shortcode( $attributes ) {
	return @is_feed() ? '' : podlovewebplayer_render_player( 'video', $attributes );
}
// [video] is deprecated
add_shortcode( 'podlovevideo', 'podlovewebplayer_video_shortcode' );

/* Auto-detect enclosures */

// modified version of get_enclosed. Returns arrays with meta info instead of plain strings.
function podlovewebplayer_get_enclosed( $post_id ) {
	$custom_fields = get_post_custom( $post_id );
	$pung = array();

	if ( !is_array( $custom_fields ) ) {
		return $pung;
	}

	foreach ( $custom_fields as $key => $val ) {
		if ( 'enclosure' != $key || !is_array( $val ) ) {
			continue;
		}
		foreach( $val as $enc ) {
			$pung[] = explode( "\n", $enc );
		}
	}

	$podPress_enclosures = get_post_meta( $post_id, '_podPressMedia', true );
	if ( $podPress_enclosures ) {
		foreach ( $podPress_enclosures as $enclosure ) {

			$fileurl = $enclosure['URI'];

			if ( strpos( $fileurl, '://' ) === false ) {
				$config = get_option( 'podPress_config', array() );
				$podPress_upload_path = isset( $config['mediaWebPath'] ) ? $config['mediaWebPath'] : './wp-content/uploads/';
				$fileurl = trailingslashit( $podPress_upload_path ) . '/' . $fileurl;
			} 

			$pung[] = array(
				$fileurl,
				$enclosure['size'],
				str_replace(
					array( 'audio_mp3',  'audio_m4a', '_' ),
					array( 'audio/mpeg', 'audio/mp4', '/' ),
					$enclosure['type']
				),
				serialize( array( 'duration' => $enclosure['duration'] ) )
			);
		}
	}
	return apply_filters( 'get_enclosed', $pung, $post_id );
}

function podlovewebplayer_enclosures( $content ) {
	global $post;

	$wp_options = get_option('podlovewebplayer_options');

	$there_are_enclosures = (
		$enclosures = podlovewebplayer_get_enclosed( $post->ID )
		AND
		(
			isset( $wp_options['enclosure_force'] ) // forced to render enclosures by option
			OR 
			(
				strpos( $content, "[podloveaudio" ) === false AND 
				strpos( $content, "[podlovevideo" ) === false AND
				strpos( $content, "[audio" ) === false AND 
				strpos( $content, "[video" ) === false
			) // there is no manual shortcode
		)
	);

	if ( ! $there_are_enclosures ) {
		return $content;
	}

	$found_files = array();
	$duration = "";
	

	foreach( $enclosures as $enclosure ) {

		$mime_type = $enclosure[2];
		$mime_type_data = explode( "/", $mime_type );

		$type    = $mime_type_data[0];
		$subtype = $mime_type_data[1];

		$supported_sources = podlovewebplayer_get_supported_sources( $type );
		$supported_mime_types = array_flip( $supported_sources );

		if ( isset( $supported_mime_types[ $mime_type ] ) ) {
			$found_files[ $supported_mime_types[ $mime_type ] ] = trim( $enclosure[0] );
		} else {
			$found_files[ 'src' ] = trim( $enclosure[0] );
		}

		// determine duration
		if ( isset( $enclosure[3] ) && $enc3_array = unserialize( $enclosure[3] ) ) {
			if ( isset( $enc3_array['duration'] ) ) {
				$duration = 'duration="' . trim( $enc3_array['duration'] ) . '"';
			}
		}

	}

	// determine title
	 $title = "";
	if ( isset( $wp_options['enclosure_richplayer'] ) ) {
		$title = 'title="' . $post->post_title . '"';
	}

	$file_string = '';
	foreach ( $found_files as $key => $url ) {
		$file_string .= sprintf( ' %s="%s" ', $key, $url );
	}

	// generate shortcode
	$shortcode = '[podlove' . $type . ' ' . $title . ' ' . $duration . ' ' . $file_string . ']';
	$pwpcode = do_shortcode( $shortcode );

	if ( isset( $wp_options['enclosure_bottom'] ) ) {
		$content = $content . $pwpcode;
	} else {
		$content = $pwpcode . $content;
	}

	return $content;
}

function podlovewebplayer_enclosures_init() {
	$wp_options = get_option( 'podlovewebplayer_options' );
	if( !is_feed() && isset( $wp_options['enclosure_detect'] ) ) {
		// fire auto-detect script before regular shortcode, which has prio 11
		add_filter( 'the_content', 'podlovewebplayer_enclosures', 10 );
	}
}
add_action( 'wp', 'podlovewebplayer_enclosures_init' );

ob_end_clean();

/* Initialisation */

function podlovewebplayer_init() {
	wp_enqueue_script('jquery');
}
add_action('init', 'podlovewebplayer_init');
	
}



?>
