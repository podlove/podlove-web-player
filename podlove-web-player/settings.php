<?php 

if ( is_admin() ){
	global $blog_id;
	$wp_options = get_option('podlovewebplayer_options');
	wp_enqueue_style( 'mediaelementjs', plugins_url('libs/mediaelement/build/mediaelementplayer.css', __FILE__), array(), '2.0.6' );
	wp_enqueue_style( 'podlovewebplayer', plugins_url('podlove-web-player.css', __FILE__), array(), '2.0.6' );
	wp_enqueue_style( 'pwpfont', plugins_url('libs/pwpfont/css/fontello.css', __FILE__), array(), '2.0.6' );
	wp_enqueue_style( 'pwpdesigner', plugins_url('libs/pwpdesigner/style.css', __FILE__), array(), '2.0.6' );
	if(($wp_options['style_custom'] !== '')&&(isset($wp_options['style_custom']))) {
		wp_enqueue_style( 'custom-pwp-style', plugins_url('customcss/pwp_custom_id-'.$blog_id.'.css', __FILE__), array(), $wp_options['style_version'] );
	} else {
		wp_dequeue_style( 'custom-pwp-style');
	}
	wp_enqueue_script( 'colorconverter', plugins_url('libs/pwpdesigner/colorconv.js', __FILE__), array(), '2.0.6' );
	wp_enqueue_script( 'pwpdesigner', plugins_url('libs/pwpdesigner/script.js', __FILE__), array(), '2.0.6' );
	
	add_action( 'admin_menu', 'podlovewebplayer_create_menu' );
	add_action( 'admin_init', 'podlovewebplayer_register_settings' );
}

function css_path() {
	global $blog_id;
	$cssid = '_id-'.$blog_id;
	return plugin_dir_path(__FILE__) . "customcss/pwp_custom" . $cssid . ".css";
}

function css_url() {
	global $blog_id;
	$cssid = '_id-'.$blog_id;
	return plugin_dir_url(__FILE__) . "customcss/pwp_custom" . $cssid . ".css";
}

function custompwpstyle() {
	$options = get_option('podlovewebplayer_options');
	$customstyle = $options['style_custom'];
	return $customstyle;
}

function makecss() {
	if(chmod(plugin_dir_path(__FILE__) . "customcss/",0755)) {
		$makecss = file_put_contents(css_path(), "/* PodloveWebPlayer Custom Style */\n\n" . custompwpstyle());
		return $makecss;
	}
}

function podlovewebplayer_settings_page() { ?>
	<div class="wrap">
		<h2>Podlove Web Player Options</h2>
		<form method="post" action="options.php">
			<?php settings_fields('podlovewebplayer_options'); ?>
			<?php do_settings_sections('podlovewebplayer'); ?>
			<p class="submit">
			 <input name="Submit" type="submit" class="button button-primary" value="<?php esc_attr_e('Save Changes'); ?>" />
			</p>
		</form>
	</div>
<?php } 


function podlovewebplayer_create_menu() {
	add_options_page(
		'Podlove Web Player Options', 
		'Podlove Web Player', 
		'manage_options', 
		'podlovewebplayer', 
		'podlovewebplayer_settings_page'
	);
}

function podlovewebplayer_register_settings() {
	$pwp = 'podlovewebplayer';

	$settings = array(
		'audio' => array(
			'title'  => 'Audio player defaults',
			'fields' => array(
				'width'  => 'Audio width',
				'height' => 'Audio height',
				'type'   => 'Default MIME type'
			)
		),
		'video' => array(
			'title'  => 'Video player defaults',
			'fields' => array(
				'width'  => 'Video width',
				'height' => 'Video height',
				'type'   => 'Default MIME type'
			)
		),
		'enclosure' => array(
			'title'    => 'WordPress “enclosures”',
			'function' => true,
			'fields'   => array(
				'detect'     => 'Turn enclosures to players:',
				'force'      => 'Force enclosure:',
				'richplayer' => 'Advanced player:',
				'bottom'     => 'Put player to bottom of post:'
			)
		),
		'style' => array(
			'title'    => 'Player Style',
			'fields' => array(
				'custom'  => 'Style your Player:',
				'values'  => 'Designer Console:',
				'version' => 'Custon Style Version:'
			)
		),
		'info' => array(
			'title'    => 'Information',
			'function' => true
		)
	);

	register_setting( 'podlovewebplayer_options', 'podlovewebplayer_options' );

	foreach($settings as $sectionname => $section) {
		$function = false;
		if ( isset( $section['function'] ) )
			$function = $pwp.'_'.$sectionname;
		add_settings_section( $pwp.'_'.$sectionname, $section['title'], $function, $pwp );
		if ( isset( $section['fields'] ) ) {
			$i = 0;
			foreach( $section['fields'] as $fieldname => $description ) {
				$i += 1;
				add_settings_field( 
					$pwp.'_'.$sectionname.'_'.$fieldname, 
					$description, $pwp.'_'.$sectionname.'_'.$fieldname, 
					$pwp, $pwp.'_'.$sectionname,
					array( 'label_for' => 'pwp'.$sectionname.$i ) 
				);
			}
		}
	}
}


function podlovewebplayer_audio_width(){
	$options = get_option('podlovewebplayer_options');
	if ( !isset( $options['audio_width'] ) )
		$options['audio_width'] = '';
	print "<input id='pwpaudio1' name='podlovewebplayer_options[audio_width]' 
		value='".$options['audio_width']."' style='width:3em;' /> px&nbsp;&nbsp;(keep blank for automatic width)";
}

function podlovewebplayer_audio_height() {
	$options = get_option('podlovewebplayer_options');
	if ( !isset( $options['audio_width'] ) )
		$options['audio_height'] = "30";
	print "<input id='pwpaudio2' name='podlovewebplayer_options[audio_height]' 
		value='".$options['audio_height']."' style='width:3em;' /> px&nbsp;&nbsp;(keep 30, if unsure)";
}

function podlovewebplayer_audio_type() { 
	$options = get_option('podlovewebplayer_options');
	if (( !isset( $options['audio_type'] ) ) || ( $options['audio_type'] == 'audio/mp3' ))
		$options['audio_type'] = 'audio/mpeg';
	print "<input id='pwpaudio3' name='podlovewebplayer_options[audio_type]' 
		value='".$options['audio_type']."' style='width:6em;' />&nbsp;&nbsp;(such as \"audio/mpeg\")";
}

function podlovewebplayer_video_width() { 
	$options = get_option('podlovewebplayer_options');
	if ( !isset( $options['video_width'] ) )
		$options['video_width'] = "640";
	print "<input id='pwpvideo1' name='podlovewebplayer_options[video_width]' 
		value='".$options['video_width']."' style='width:3em' /> px";
}

function podlovewebplayer_video_height() { 
	$options = get_option('podlovewebplayer_options');
	if ( !isset( $options['video_height'] ) )
		$options['video_height'] = "270";
	print "<input id='pwpvideo2' name='podlovewebplayer_options[video_height]' 
		value='".$options['video_height']."' style='width:3em' /> px";
}

function podlovewebplayer_video_type() { 
	$options = get_option('podlovewebplayer_options');
	if ( !isset( $options['video_type'] ) )
		$options['video_type'] = "video/mp4";
	print "<input id='pwpvideo3' name='podlovewebplayer_options[video_type]' 
		value='".$options['video_type']."' style='width:6em;' />
		&nbsp;&nbsp;(such as \"video/mp4\")";
}

function podlovewebplayer_enclosure() {
	print "<p>WordPress automatically creates an \"enclosure\" custom field whenever it detects an URL to a media file in the post text. 
		Use this option to turn these enclosures into Podlove Web Player instances.</p>\n\n
	<script>
	jQuery(function($){
		$('#pwpenclosure1').change(function(){
			if (this.checked == false) {
				$('#pwpenclosure2')[0].checked = false;
			}
		});
	});
	</script>";
}

function podlovewebplayer_enclosure_detect() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['enclosure_detect'] ) )
		$checked = "checked ";
	print "<input id='pwpenclosure1' name='podlovewebplayer_options[enclosure_detect]' 
		$checked type='checkbox' value='1' />";
}

function podlovewebplayer_enclosure_force() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['enclosure_force'] ) )
		$checked = "checked ";
	print "<input id='pwpenclosure2' name='podlovewebplayer_options[enclosure_force]' 
		$checked type='checkbox' value='1' />&nbsp;&nbsp;
		(additionally to manually shortcoded Podlove Web Players, if both are present)";
}

function podlovewebplayer_enclosure_richplayer() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['enclosure_richplayer'] ) )
		$checked = "checked ";
	print "<input id='pwpenclosure3' name='podlovewebplayer_options[enclosure_richplayer]' 
		$checked type='checkbox' value='1' />&nbsp;&nbsp;
		(Use advanced player for enclosures)";
}


function podlovewebplayer_enclosure_bottom() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['enclosure_bottom'] ) )
		$checked = "checked ";
	print "<input id='pwpenclosure4' name='podlovewebplayer_options[enclosure_bottom]' 
		$checked type='checkbox' value='1' />&nbsp;&nbsp;
		(instead of the top)";
}

function podlovewebplayer_style() { 
	print "<div class='wrap'><h2>Custom CSS Style</h2>";
}

function podlovewebplayer_style_custom() { 
	$options = get_option('podlovewebplayer_options');
	print "<textarea name='podlovewebplayer_options[style_custom]' id='pwpstyle1' dir='ltr' style='display:none;'>".$options['style_custom']."</textarea><script language='javascript'></script><p></p>
<div class='colorslider'><div id='color1' class='box'>
	<div><label for='hue'>Hue</label><input id='hue' onchange='pwpdcolorize();' name='hue' type='range' max='360' min='0'></div>
	<div><label for='sat'>Saturation</label><input id='sat' onchange='pwpdcolorize();' name='sat' type='range' max='100' min='0'></div>
	<div><label for='lum'>Luminance</label><input id='lum' onchange='pwpdcolorize();' name='lum' type='range' max='100' min='0'></div>
	<div><label for='gra'>Gradient</label><input id='gra' onchange='pwpdcolorize();' name='gra' type='range' max='20' min='0'></div>
	<div><input type='button' onclick='pwpdinsertcolor();' class='button' value='enter color' /> <input type='button' onclick='pwpdrandomcolor();' class='button' value='random' /> <input type='button' onclick='pwpdcolorreset();' class='button' value='reset' /> <input name='Submit' type='submit' class='button button-primary' value='save'/></div><br/>
</div></div></div>";
	print '<audio id="demoplayer">
			<source src="http://podlove.github.com/podlove-web-player/samples/podlove-test-track.mp4" type="audio/mp4"></source>
			<source src="http://podlove.github.com/podlove-web-player/samples/podlove-test-track.mp3" type="audio/mpeg"></source>
			<source src="http://podlove.github.com/podlove-web-player/samples/podlove-test-track.ogg" type="audio/ogg; codecs=vorbis"></source>
			<source src="http://podlove.github.com/podlove-web-player/samples/podlove-test-track.opus" type="audio/ogg; codecs=opus"></source>
		</audio>
		<script>
			jQuery("#demoplayer").podlovewebplayer({
				poster: "http://podlove.github.com/podlove-web-player/samples/coverimage.png",
				title: "PWP001 – Lorem ipsum dolor sit amet",
				permalink: "http://podlove.github.com/podlove-web-player/standalone.html",
				subtitle: "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.",
				chapters: "00:00:00.000 Chapter One"
+"\n"+"00:00:01.000 Chapter Two"
+"\n"+"00:00:01.500 Chapter Three",
				summary: "<p>Summary and even links <a href=\"https://github.com/gerritvanaaken/podlove-web-player\">Podlove Web Player</a>"
+"\n"+"Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>"
+"\n"+"<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Nulla vitae elit libero, a pharetra augue. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>",
				duration: "00:02.500",
				alwaysShowHours: true,
				startVolume: 0.3,
				width: "auto",
				summaryVisible: false,
				timecontrolsVisible: false,
				sharebuttonsVisible: false,
				chaptersVisible: true	
			});
		</script>';
	$custompwpstyle = custompwpstyle();
	if (!empty($custompwpstyle)) {
		makecss();
	} elseif (empty($custompwpstyle) && file_exists(css_path())) {
		unlink(css_path());
	}
}

function podlovewebplayer_style_values() { 
	$options = get_option('podlovewebplayer_options');
	if ( !isset( $options['style_values'] ) )
		$options['style_values'] = "{'hue':180,'sat':0,'lum':33,'gra':9}";
	print "<input id='pwpconsole' name='podlovewebplayer_options[style_values]' 
		value='".$options['style_values']."' style='width:19em;' />";
}

function podlovewebplayer_style_version() { 
	$options = get_option('podlovewebplayer_options');
	if ( !isset( $options['style_version'] ) ) {
		$options['style_version'] = 1;
	} else {
		$options['style_version'] = $options['style_version']+1;
	}
	print $options['style_version']."<input id='pwpcustomstyleversion' name='podlovewebplayer_options[style_version]' 
		value='".$options['style_version']."' style='display:none;' />";
}

function podlovewebplayer_info() {
	$scriptname = explode('/wp-admin', $_SERVER["SCRIPT_FILENAME"]);
	$dirname    = explode('/wp-content', dirname(__FILE__));
	print '<p>This is <strong>Version 2.0.6</strong> of the <strong>Podlove Web Player</strong>.<br>
	The <strong>Including file</strong> is: <code>wp-admin'.$scriptname[1].'</code><br>
	The <strong>PWP-directory</strong> is: <code>wp-content'.$dirname[1].'</code></p>
	<p>Want to contribute? Found a bug? Need some help? <br/>you can found our github repo/page at
	<a href="https://github.com/podlove/podlove-web-player">github.com/podlove/podlove-web-player</a></p>
	<p>If you found a bug, please tell us your WP- and PWP- (and PPP- if you use PPP) Version. <br/>Also your 
	Browser version, your PHP version and the URL of your Podcast can help us, find the bug.</p>';
}

?>
