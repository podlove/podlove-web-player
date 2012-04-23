<?php
/**
 * @package PodloveWebPlayer
 * @version 0.9
 */

/*
Plugin Name: Podlove Web Player
Plugin URI: http://podlove.org/podlove-web-player/
Description:
Author: Gerrit van Aaken
Version: 0.9
Author URI: http://praegnanz.de
License: GPLv3, MIT
*/

/*
Forked from: http://mediaelementjs.com/ plugin
which was adapted from: http://videojs.com/ plugin
*/

$podlovePlayerIndex = 1;
define('MEDIAELEMENTJS_DIR', plugin_dir_url(__FILE__) . 'mediaelement/');

/* Runs when plugin is activated */
register_activation_hook(__FILE__, 'mejs_install');

function mejs_install() {
    add_option('mep_video_skin', '');
    add_option('mep_script_on_demand', false);

    add_option('mep_default_video_height', 270);
    add_option('mep_default_video_width', 480);
    add_option('mep_default_video_type', '');

    add_option('mep_default_audio_height', 30);
    add_option('mep_default_audio_width', 400);
    add_option('mep_default_audio_type', '');
}

/* Runs on plugin deactivation*/
register_deactivation_hook(__FILE__, 'mejs_remove');

function mejs_remove() {
    delete_option('mep_video_skin');
    delete_option('mep_script_on_demand');

    delete_option('mep_default_video_height');
    delete_option('mep_default_video_width');
    delete_option('mep_default_video_type');

    delete_option('mep_default_audio_height');
    delete_option('mep_default_audio_width');
    delete_option('mep_default_audio_type');
}

// create custom plugin settings menu
add_action('admin_menu', 'mejs_create_menu');

function mejs_create_menu() {
    //create new top-level menu
    add_options_page('Podlove Web Player Options', 'Podlove Player', 'administrator', __FILE__, 'mejs_settings_page');

    //call register settings function
    add_action( 'admin_init', 'mejs_register_settings' );
}


function mejs_register_settings() {
    //register our settings
    register_setting('mep_settings', 'mep_video_skin');
    register_setting('mep_settings', 'mep_script_on_demand');

    register_setting('mep_settings', 'mep_default_video_height');
    register_setting('mep_settings', 'mep_default_video_width');
    register_setting('mep_settings', 'mep_default_video_type');

    register_setting('mep_settings', 'mep_default_audio_height');
    register_setting('mep_settings', 'mep_default_audio_width');
    register_setting('mep_settings', 'mep_default_audio_type');
}


function mejs_settings_page() {
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
                <label for="mep_script_on_demand">Load Script on Demand</label>
            </th>
            <td >
                <input name="mep_script_on_demand" type="checkbox" id="mep_script_on_demand" <?php echo (get_option('mep_script_on_demand') == true ? "checked" : "")  ?> />
            </td>
        </tr>
    </table>


    <h3 class="title"><span>Video Settings</span></h3>

    <table class="form-table">
        <tr valign="top">
            <th scope="row">
                <label for="mep_default_video_width">Default Width</label>
            </th>
            <td >
                <input name="mep_default_video_width" type="text" id="mep_default_video_width" value="<?php echo get_option('mep_default_video_width'); ?>" />
            </td>
        </tr>
        <tr valign="top">
            <th scope="row">
                <label for="mep_default_video_height">Default Height</label>
            </th>
            <td >
                <input name="mep_default_video_height" type="text" id="mep_default_video_height" value="<?php echo get_option('mep_default_video_height'); ?>" />
            </td>
        </tr> 
        <tr valign="top">
            <th scope="row">
                <label for="mep_default_video_type">Default Type</label>
            </th>
            <td >
                <input name="mep_default_video_type" type="text" id="mep_default_video_type" value="<?php echo get_option('mep_default_video_type'); ?>" /> <span class="description">such as "video/mp4"</span>
            </td>
        </tr> 
        <tr valign="top">
            <th scope="row">
                <label for="mep_video_skin">Video Skin</label>
            </th>
            <td >
                <select name="mep_video_skin" id="mep_video_skin">
                    <option value="" <?php echo (get_option('mep_video_skin') == '') ? ' selected' : ''; ?>>Default</option>
                    <option value="wmp" <?php echo (get_option('mep_video_skin') == 'wmp') ? ' selected' : ''; ?>>WMP</option>
                    <option value="ted" <?php echo (get_option('mep_video_skin') == 'ted') ? ' selected' : ''; ?>>TED</option>
                </select>
            </td>
        </tr>
    </table>


    <h3 class="title"><span>Audio Settings</span></h3>

    <table class="form-table">
        <tr valign="top">
        <tr valign="top">
            <th scope="row">
                <label for="mep_default_audio_width">Default Width</label>
            </th>
            <td >
                <input name="mep_default_audio_width" type="text" id="mep_default_audio_width" value="<?php echo get_option('mep_default_audio_width'); ?>" />
            </td>
        </tr>
        <tr valign="top">
            <th scope="row">
                <label for="mep_default_audio_height">Default Height</label>
            </th>
            <td >
                <input name="mep_default_audio_height" type="text" id="mep_default_audio_height" value="<?php echo get_option('mep_default_audio_height'); ?>" />
            </td>
        </tr>
            <th scope="row">
                <label for="mep_default_audio_type">Default Type</label>
            </th>
            <td >
                <input name="mep_default_audio_type" type="text" id="mep_default_audio_type" value="<?php echo get_option('mep_default_audio_type'); ?>" /> <span class="description">such as "audio/mp3"</span>
            </td>
        </tr>
    </table>

    <input type="hidden" name="action" value="update" />
    <input type="hidden" name="page_options" value="mep_default_video_width,mep_default_video_height,mep_default_video_type,mep_default_audio_type,mep_default_audio_width,mep_default_audio_height,mep_video_skin,mep_script_on_demand" />

    <p>
        <input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />
    </p>

</div>



</form>
</div>
<?php
}


// Javascript

// This is now handled by calling wp_enqueue_script inside the mejs_media_shortcode function by default. This means that MediaElement.js's JavaScript will only be called as needed
if (!get_option('mep_script_on_demand')) {
function mejs_add_scripts() {
    if (!is_admin()) {
        // the scripts
        wp_enqueue_script('podlove-scripts', MEDIAELEMENTJS_DIR . 'mediaelement-and-player.min.js', array('jquery'), '2.7.1', false);
        wp_enqueue_script('podlove-chapters', plugin_dir_url(__FILE__) . 'podlove-chapters.js', array('jquery'), '2.7.1', false);
    }
}
add_action('wp_print_scripts', 'mejs_add_scripts');
}

// CSS
// still always enqueued so it happens in the <head> tag
function mejs_add_styles() {
    if (!is_admin()) {
        // the style
        wp_enqueue_style('mediaelementjs-styles', MEDIAELEMENTJS_DIR . 'mediaelementplayer.css');

        if (get_option('mep_video_skin') != '') {
            wp_enqueue_style('mediaelementjs-skins', MEDIAELEMENTJS_DIR . 'mejs-skins.css');
        }
    }
}
add_action('wp_print_styles', 'mejs_add_styles');


function podlove_media_shortcode($tagName, $atts) {
    // only enqueue when needed
    if (get_option('mep_script_on_demand')) {
        wp_enqueue_script('mediaelementjs-scripts', MEDIAELEMENTJS_DIR . 'mediaelement-and-player.min.js', array('jquery'), '2.7.0', false);
    }

    global $podlovePlayerIndex;
    $dir = MEDIAELEMENTJS_DIR;
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
        'width' => get_option('mep_default_' . $tagName . '_width'),
        'height' => get_option('mep_default_' . $tagName . '_height'),
        'type' => get_option('mep_default_' . $tagName . '_type'),
        'preload' => 'none',
        'skin' => get_option('mep_video_skin'),
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
        } else {

            // for missing extension, we try to find all possible files in the system

            if (substr($src, 0, 4) != 'http') {
                $filename = WP_CONTENT_DIR . substr($src, strlen(WP_CONTENT_DIR) - strrpos(WP_CONTENT_DIR, '/'));
            } else {
                $filename = WP_CONTENT_DIR . substr($src, strlen(WP_CONTENT_URL));
            }

            if ($tagName == 'video') {
                // MP4
                if (file_exists($filename . '.mp4')) {
                    $mp4 = $src . '.mp4';
                } elseif (file_exists($filename . '.m4v')) {
                    $mp4 = $src . '.m4v';
                }

                // WEBM
                if (file_exists($filename . '.webm')) {
                    $webm = $src . '.webm';
                }

                // OGG
                if (file_exists($filename . '.ogg')) {
                    $ogg = $src . '.ogg';
                } elseif (file_exists($filename . '.ogv')) {
                    $ogg = $src . '.ogv';
                }

                // FLV
                if (file_exists($filename . '.flv')) {
                    $flv = $src . '.flv';
                }

                // WMV
                if (file_exists($filename . '.wmv')) {
                    $wmv = $src . '.wmv';
                }

                // POSTER
                if (file_exists($filename . '.jpg')) {
                    $poster = $src . '.jpg';
                }
            } elseif ($tagName == 'audio') {
                // MP3
                if (file_exists($filename . '.mp3')) {
                    $mp3 = $src . '.mp3';
                }

                // OGG
                if (file_exists($filename . '.ogg')) {
                    $ogg = $src . '.ogg';
                } elseif (file_exists($filename . '.oga')) {
                    $ogg = $src . '.oga';
                }
            }
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
    <{$tagName} id="wp_mep_{$podlovePlayerIndex}" controls="controls" {$attributes_string} class="mejs-player {$skin_class}" data-mejsoptions='{$options_string}'>
        {$sources_string}
        <object width="{$width}" height="{$height}" type="application/x-shockwave-flash" data="{$dir}flashmediaelement.swf">
            <param name="movie" value="{$dir}flashmediaelement.swf" />
            <param name="flashvars" value="controls=true&amp;file={$flash_src}" />
        </object>
    </{$tagName}>
_end_;

    // Chapters Table and Behaviour
    if ($chapters) {
        $mediahtml .= "\n\n" . podlove_render_chapters($chapters);
        $mediahtml .= "\n\n<script>PODLOVE.chapters('wp_mep_{$podlovePlayerIndex}');</script>\n";
    }

    $podlovePlayerIndex++;
    return $mediahtml;
}


function podlove_render_chapters($custom_field) {
    global $post;
    global $podlovePlayerIndex;

    if ($custom_field != '' && $chapters = get_post_custom_values($custom_field, $post->ID)) {
        $chapters = podlove_chapters_from_string($chapters[0]);

        //echo "<pre>";
        //var_dump ($chapters);
        //echo "</pre>";

        $output .= '<table rel="wp_mep_' . $podlovePlayerIndex . '" class="mejs_chapters" style="display:none"><tbody>';
        foreach ($chapters as $i => $chapter) {
            $end = ($i == (count($chapters) - 1)) ? '9999999' : $chapters[$i + 1]['timecode'];
            $output .= '<tr>';
            $output .= '<td class="timecode"><code>' . $chapter['human_timecode'] . '</code></td>';
            $output .= '<td class="title"><span data-buffered="0" data-start="' . $chapter['timecode'] . '" data-end="' . $end . '">' . $chapter['title'] . '</span></td>';
            $output .= '</tr>';
        }
        $output .= '</tbody></table>';


        return $output;
    } else {
        return false;
    }
}

function podlove_chapters_from_string($chapstring) {
    $lines = explode("\n", $chapstring);
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
    return $chapters;
}



function podlove_audio_shortcode($atts) {
    return is_feed() ? '' : podlove_media_shortcode('audio', $atts);
}
function podlove_video_shortcode($atts) {
    return is_feed() ? '' : podlove_media_shortcode('video', $atts);
}

add_shortcode('audio', 'podlove_audio_shortcode');
add_shortcode('podloveaudio', 'podlove_audio_shortcode');
add_shortcode('video', 'podlove_video_shortcode');
add_shortcode('podlovevideo', 'podlove_video_shortcode');

function podlove_init() {
    wp_enqueue_script('jquery');
}

add_action('init', 'podlove_init');

?>