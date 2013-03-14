<?php 

if ( is_admin() ){
	add_action( 'admin_menu', 'podlovewebplayer_create_menu' );
	add_action( 'admin_init', 'podlovewebplayer_register_settings' );
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
		'buttons' => array(
			'title'    => 'PWP buttons',
			'function' => true,
			'fields'   => array(
				'time'      => 'Hide time buttons:',
				'download'  => 'Hide download buttons:',
				'share'     => 'Hide share buttons:',
				'sharemode' => 'share the whole episode:'
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
		$options['audio_width'] = "";
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
	if ( !isset( $options['audio_type'] ) )
		$options['audio_type'] = "audio/mp3";
	print "<input id='pwpaudio3' name='podlovewebplayer_options[audio_type]' 
		value='".$options['audio_type']."' style='width:6em;' />&nbsp;&nbsp;(such as \"audio/mp3\")";
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

function podlovewebplayer_buttons() {
	print "<p>Here you can select, which buttons will be displayd and (for the share buttons) what happens on a click. The Chapter-Toggle- and Summary-Info-Button are not configurable here, because they automaticle hidden, when no chapters/summary are provided.</p>\n\n";
}

function podlovewebplayer_buttons_time() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['buttons_time'] ) )
		$checked = "checked ";
	print "<input id='pwpbuttons1' name='podlovewebplayer_options[buttons_time]' 
		$checked type='checkbox' value='1' />&nbsp;&nbsp;";
}

function podlovewebplayer_buttons_download() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['buttons_download'] ) )
		$checked = "checked ";
	print "<input id='pwpbuttons2' name='podlovewebplayer_options[buttons_download]' 
		$checked type='checkbox' value='1' />&nbsp;&nbsp;";
}

function podlovewebplayer_buttons_share() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['buttons_share'] ) )
		$checked = "checked ";
	print "<input id='pwpbuttons3' name='podlovewebplayer_options[buttons_share]' 
		$checked type='checkbox' value='1' />&nbsp;&nbsp;";
}

function podlovewebplayer_buttons_sharemode() { 
	$options = get_option('podlovewebplayer_options');
	$checked = "";
	if ( isset( $options['buttons_sharemode'] ) )
		$checked = "checked ";
	print "<input id='pwpbuttons4' name='podlovewebplayer_options[buttons_sharemode]' 
		$checked type='checkbox' value='1' />&nbsp;&nbsp;
		(instead of current position)";
}

function podlovewebplayer_info() {
	$scriptname = explode('/wp-admin', $_SERVER["SCRIPT_FILENAME"]);
	$dirname    = explode('/wp-content', dirname(__FILE__));
	print '<p>This is <strong>Version 2.0.5</strong> of the <strong>Podlove Web Player</strong>.<br>
	The <strong>Including file</strong> is: <code>wp-admin'.$scriptname[1].'</code><br>
	The <strong>PWP-directory</strong> is: <code>wp-content'.$dirname[1].'</code></p>
	<p>Want to contribute? Found a bug? Need some help? <br/>you can found our github repo/page at
	<a href="https://github.com/podlove/podlove-web-player">github.com/podlove/podlove-web-player</a></p>
	<p>If you found a bug, please tell us your WP- and PWP- (and PPP- if you use PPP) Version. <br/>Also your 
	Browser version, your PHP version and the URL of your Podcast can help us, find the bug.</p>';
}

?>
