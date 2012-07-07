<?php
/**
 * @package PodloveWebPlayer
 * @version 1.0.7
 */

/*
Plugin Name: Podlove Web Player
Plugin URI: http://podlove.org/podlove-web-player/
Description: Video and audio plugin for WordPress built on the MediaElement.js HTML5 media player library.
Author: Gerrit van Aaken and others
Version: 1.0.7
Author URI: http://praegnanz.de
License: GPLv3, MIT
*/

/*
Forked from: http://mediaelementjs.com/ plugin
which was adapted from: http://videojs.com/ plugin
*/

$podlovePlayerIndex = 1;
define('PODLOVEWEBPLAYER_DIR', plugin_dir_url(__FILE__) . 'mediaelement/');

/* Runs when plugin is activated */
register_activation_hook(__FILE__, 'podlove_pwp_install');

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

/* Runs on plugin deactivation*/
register_deactivation_hook(__FILE__, 'podlove_pwp_remove');

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

// create custom plugin settings menu
add_action('admin_menu', 'podlove_pwp_create_menu');

function podlove_pwp_create_menu() {
    //create new top-level menu
    add_options_page('Podlove Web Player Options', 'Podlove Web Player', 'administrator', __FILE__, 'podlove_pwp_settings_page');

    //call register settings function
    add_action( 'admin_init', 'podlove_pwp_register_settings' );
}


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


function podlove_pwp_settings_page() {
?>
<div class="wrap">
<h2>Podlove Web Player Options</h2>

<p>See <a href="http://mediaelementjs.com/">MediaElementjs.com</a> for more details on how the HTML5 player and Flash fallbacks work.</p>

<form method="post" action="options.php">
<?php wp_nonce_field('update-options'); ?>


    <h3 class="title"><span>General Settings</span></h3>

    <table class="form-table">
        <tr valign="top">
            <th scope="row">
                <label for="pwp_script_on_demand">Load Script on Demand</label>
            </th>
            <td >
                <input name="pwp_script_on_demand" type="checkbox" id="pwp_script_on_demand" <?php echo (get_option('pwp_script_on_demand') == true ? "checked" : "")  ?> />
            </td>
        </tr>
    </table>


    <h3 class="title"><span>Video Settings</span></h3>

    <table class="form-table">
        <tr valign="top">
            <th scope="row">
                <label for="pwp_default_video_width">Default Width</label>
            </th>
            <td >
                <input name="pwp_default_video_width" type="text" id="pwp_default_video_width" value="<?php echo get_option('pwp_default_video_width'); ?>" />
            </td>
        </tr>
        <tr valign="top">
            <th scope="row">
                <label for="pwp_default_video_height">Default Height</label>
            </th>
            <td >
                <input name="pwp_default_video_height" type="text" id="pwp_default_video_height" value="<?php echo get_option('pwp_default_video_height'); ?>" />
            </td>
        </tr> 
        <tr valign="top">
            <th scope="row">
                <label for="pwp_default_video_type">Default Type</label>
            </th>
            <td >
                <input name="pwp_default_video_type" type="text" id="pwp_default_video_type" value="<?php echo get_option('pwp_default_video_type'); ?>" /> <span class="description">such as "video/mp4"</span>
            </td>
        </tr> 
        <tr valign="top">
            <th scope="row">
                <label for="pwp_video_skin">Video Skin</label>
            </th>
            <td >
                <select name="pwp_video_skin" id="pwp_video_skin">
                    <option value="" <?php echo (get_option('pwp_video_skin') == '') ? ' selected' : ''; ?>>Default</option>
                    <option value="wmp" <?php echo (get_option('pwp_video_skin') == 'wmp') ? ' selected' : ''; ?>>WMP</option>
                    <option value="ted" <?php echo (get_option('pwp_video_skin') == 'ted') ? ' selected' : ''; ?>>TED</option>
                </select>
            </td>
        </tr>
    </table>


    <h3 class="title"><span>Audio Settings</span></h3>

    <table class="form-table">
        <tr valign="top">
        <tr valign="top">
            <th scope="row">
                <label for="pwp_default_audio_width">Default Width</label>
            </th>
            <td >
                <input name="pwp_default_audio_width" type="text" id="pwp_default_audio_width" value="<?php echo get_option('pwp_default_audio_width'); ?>" />
            </td>
        </tr>
        <tr valign="top">
            <th scope="row">
                <label for="pwp_default_audio_height">Default Height</label>
            </th>
            <td >
                <input name="pwp_default_audio_height" type="text" id="pwp_default_audio_height" value="<?php echo get_option('pwp_default_audio_height'); ?>" />
            </td>
        </tr>
            <th scope="row">
                <label for="pwp_default_audio_type">Default Type</label>
            </th>
            <td >
                <input name="pwp_default_audio_type" type="text" id="pwp_default_audio_type" value="<?php echo get_option('pwp_default_audio_type'); ?>" /> <span class="description">such as "audio/mp3"</span>
            </td>
        </tr>
    </table>

    <input type="hidden" name="action" value="update" />
    <input type="hidden" name="page_options" value="pwp_default_video_width,pwp_default_video_height,pwp_default_video_type,pwp_default_audio_type,pwp_default_audio_width,pwp_default_audio_height,pwp_video_skin,pwp_script_on_demand" />

    <p>
        <input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />
    </p>

</div>



</form>
</div>
<?php
}


// Javascript

// This is now handled by calling wp_enqueue_script inside the pwp_media_shortcode function by default. This means that MediaElement.js's JavaScript will only be called as needed
if (!get_option('pwp_script_on_demand')) {
function podlove_pwp_add_scripts() {
    if (!is_admin()) {
        // the scripts
        wp_enqueue_script('mediaelementjs-scripts', PODLOVEWEBPLAYER_DIR . 'mediaelement-and-player.min.js', array('jquery'), '2.9.1', false);
        wp_enqueue_script('ba-hashchange', plugin_dir_url(__FILE__) . 'libs/jquery.ba-hashchange.min.js', array('jquery'), '1.3.0', false);
        wp_enqueue_script('podlove-web-player', plugin_dir_url(__FILE__) . 'podlove-web-player.js', array('jquery', 'mediaelementjs-scripts'), '1.0.7', false);
    }
}
add_action('wp_print_scripts', 'podlove_pwp_add_scripts');
}

// CSS
// still always enqueued so it happens in the <head> tag
function podlove_pwp_add_styles() {
    if (!is_admin()) {
        // the style
        wp_enqueue_style('mediaelementjs-styles', PODLOVEWEBPLAYER_DIR . 'mediaelementplayer.css');
        wp_enqueue_style('podlovewebplayer-styles', plugin_dir_url(__FILE__) . 'podlove-web-player.css');

        if (get_option('pwp_video_skin') != '') {
            wp_enqueue_style('mediaelementjs-skins', PODLOVEWEBPLAYER_DIR . 'mejs-skins.css');
        }
    }
}
add_action('wp_print_styles', 'podlove_pwp_add_styles');


function podlove_pwp_media_shortcode($tagName, $atts) {
    // only enqueue when needed
    if (get_option('pwp_script_on_demand')) {
        wp_enqueue_script('mediaelementjs-scripts', PODLOVEWEBPLAYER_DIR . 'mediaelement-and-player.min.js', array('jquery'), '2.9.1', false);
    }

    global $podlovePlayerIndex;
    $dir = PODLOVEWEBPLAYER_DIR;
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

        // old ones
        'duration' => 'true',
        'progress' => 'true',
        'fullscreen' => 'true',
        'volume' => 'true',

        // captions
        'captions' => '',
        'captionslang' => 'en',

        // chapters
        'chapters' => ''

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
        if (substr($src, strlen($src)-4, 1) == '.') {
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
    if ($poster) {
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
    $controls_option[] = '"playpause"';
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

    // BUILD HTML
    $attributes_string = !empty($attributes) ? implode(' ', $attributes) : '';
    $sources_string = !empty($sources) ? implode("\n\t\t", $sources) : '';
    $options_string = !empty($options) ? '{' . implode(',', $options) . '}' : '';

    $mediahtml = <<<_end_
    <div class="mediaelementjs_player_container">
    <{$tagName} width="{$width}" height="{$height}" id="wp_pwp_{$podlovePlayerIndex}" controls="controls" {$attributes_string} class="{$skin_class}" data-mejsoptions='{$options_string}'>
        {$sources_string}
    </{$tagName}>
_end_;

    // Chapters Table and Behaviour
    if ($chapters) {
        if ($chaptertable = podlove_pwp_render_chapters($chapters)) {
            $mediahtml .= "\n\n" . $chaptertable;
        }
    }
    $mediahtml .= "\n\n</div>\n\n<script>jQuery(function() { PODLOVE.web_player('wp_pwp_{$podlovePlayerIndex}');});</script>\n";

    $podlovePlayerIndex++;
    return $mediahtml;
}


function podlove_pwp_render_chapters($custom_field) {
    global $post;
    global $podlovePlayerIndex;
    $custom_field = trim($custom_field);

    if ($custom_field != '') {
        if (substr($custom_field,0,7) == "http://" 
            || substr($custom_field,0,8) == "https://") {
            $chapters[0] = trim(file_get_contents($custom_field));
        } elseif ($chapters = get_post_custom_values($custom_field, $post->ID)) {
        } else {
            return false;
        }
        if ($chapters = podlove_pwp_chapters_from_string($chapters[0])) {
            $output = '<table rel="wp_pwp_' . $podlovePlayerIndex . '" class="pwp_chapters" style="display:none"><tbody>';
            foreach ($chapters as $i => $chapter) {
                $end = ($i == (count($chapters) - 1)) ? '9999999' : $chapters[$i + 1]['timecode'];
                $output .= '<tr>';
                $output .= '<td class="timecode"><code>' . $chapter['human_timecode'] . '</code></td>';
                $output .= '<td class="title"><span data-buffered="0" data-start="' . $chapter['timecode'] . '" data-end="' . $end . '">' . $chapter['title'] . '</span></td>';
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
            $mins = substr($time, 3, 2);
            $secs = substr($time, 6, 2);
            $msecs = count(substr($time, 9, 1)) ? substr($time, 9, 3) : 0;

            $chapters[$i]['title'] = trim(substr($line, $div + 1));
            $chapters[$i]['human_timecode'] = substr($time, 0, 8);
            $chapters[$i]['timecode'] = ($hours * 3600 + $mins * 60 + $secs * 1) . '.' . floor($msecs);
            $chapters[$i]['hours'] = $hours;
            $chapters[$i]['minutes'] = $mins;
            $chapters[$i]['seconds'] = $secs;
            $chapters[$i]['milliseconds'] = $msecs;
        }
    }
    if ($chapters[$i]['hours'] == '00') {
        foreach ($chapters as $i => $chapter) {
            $chapters[$i]['human_timecode'] = substr($chapter['human_timecode'], 3);
        }
    }
    if (count($chapters) > 0) {
        return $chapters;
    } else {
        return false;
    }
}



function podlove_pwp_audio_shortcode($atts) {
    return is_feed() ? '' : podlove_pwp_media_shortcode('audio', $atts);
}
function podlove_pwp_video_shortcode($atts) {
    return is_feed() ? '' : podlove_pwp_media_shortcode('video', $atts);
}

add_shortcode('audio', 'podlove_pwp_audio_shortcode');
add_shortcode('podloveaudio', 'podlove_pwp_audio_shortcode');
add_shortcode('video', 'podlove_pwp_video_shortcode');
add_shortcode('podlovevideo', 'podlove_pwp_video_shortcode');

function podlove_pwp_init() {
    wp_enqueue_script('jquery');
}

add_action('init', 'podlove_pwp_init');

?>
