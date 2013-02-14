<?php function podlovewebplayer_settings_page() { ?>

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
  register_setting( 'podlovewebplayer_options', 'podlovewebplayer_options' );

  // audio section
  add_settings_section( 'podlovewebplayer_audio', 'Audio player defaults', false, 'podlovewebplayer' );

  add_settings_field( 
    'podlovewebplayer_audio_width', 'Audio width', 'podlovewebplayer_audio_width',
    'podlovewebplayer', 'podlovewebplayer_audio', array( 'label_for' => 'pwpaudio1' )
  );
  

  add_settings_field( 
    'podlovewebplayer_audio_height', 'Audio height', 'podlovewebplayer_audio_height',
    'podlovewebplayer', 'podlovewebplayer_audio', array( 'label_for' => 'pwpaudio2' )
  );
  

  add_settings_field( 
    'podlovewebplayer_audio_type', 'Default MIME type', 'podlovewebplayer_audio_type',
    'podlovewebplayer', 'podlovewebplayer_audio', array( 'label_for' => 'pwpaudio3' )
  );
  

  // video section

  add_settings_section( 'podlovewebplayer_video', 'Video player defaults', false, 'podlovewebplayer' );

  add_settings_field( 
    'podlovewebplayer_video_width', 'Video width', 'podlovewebplayer_video_width',
    'podlovewebplayer', 'podlovewebplayer_video', array( 'label_for' => 'pwpvideo1' )
  );
  

  add_settings_field( 
    'podlovewebplayer_video_height', 'Video height', 'podlovewebplayer_video_height',
    'podlovewebplayer', 'podlovewebplayer_video', array( 'label_for' => 'pwpvideo2' )
  );
  

  add_settings_field( 
    'podlovewebplayer_video_type', 'Default MIME type', 'podlovewebplayer_video_type',
    'podlovewebplayer', 'podlovewebplayer_video', array( 'label_for' => 'pwpaudio3' )
  );
  

  // enclosure section

  add_settings_section( 'podlovewebplayer_enclosures', 'WordPress “enclosures”', 
    'podlovewebplayer_enclosures', 'podlovewebplayer' );
  

  add_settings_field( 
    'podlovewebplayer_enclosure_detect', 'Turn enclosures to players:', 'podlovewebplayer_enclosure_detect',
    'podlovewebplayer', 'podlovewebplayer_enclosures', array( 'label_for' => 'pwpenclosures1' )
  );
  

  add_settings_field( 
    'podlovewebplayer_enclosure_force', 'Force enclosure:', 'podlovewebplayer_enclosure_force',
    'podlovewebplayer', 'podlovewebplayer_enclosures', array( 'label_for' => 'pwpenclosures2' )
  );
  

  add_settings_field( 
    'podlovewebplayer_enclosure_richplayer', 'Advanced player:', 'podlovewebplayer_enclosure_richplayer',
    'podlovewebplayer', 'podlovewebplayer_enclosures', array( 'label_for' => 'pwpenclosures3' )
  );
  

  add_settings_field( 
    'podlovewebplayer_enclosure_bottom', 'Put player to bottom of post:', 'podlovewebplayer_enclosure_bottom',
    'podlovewebplayer', 'podlovewebplayer_enclosures', array( 'label_for' => 'pwpenclosures4' )
  );

  add_settings_section( 'podlovewebplayer_info', 'Info', 'podlovewebplayer_info', 'podlovewebplayer' );
  
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
    print "<input id='pwpaudio3' name='podlovewebplayer_options[video_type]' 
      value='".$options['video_type']."' style='width:6em;' />
      &nbsp;&nbsp;(such as \"video/mp4\")";
  }

function podlovewebplayer_enclosures() {
    print "<p>WordPress automatically creates an \"enclosure\" custom field whenever it detects an URL to a media file in the post text. 
      Use this option to turn these enclosures into Podlove Web Player instances.</p>\n\n
    <script>
    jQuery(function($){
      $('#pwpenclosures1').change(function(){
        if (this.checked == false) {
          $('#pwpenclosures2')[0].checked = false;
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
    print "<input id='pwpenclosures1' name='podlovewebplayer_options[enclosure_detect]' 
      $checked type='checkbox' value='1' />";
  }

function podlovewebplayer_enclosure_force() { 
    $options = get_option('podlovewebplayer_options');
    $checked = "";
    if ( isset( $options['enclosure_force'] ) )
      $checked = "checked ";
    print "<input id='pwpenclosures2' name='podlovewebplayer_options[enclosure_force]' 
      $checked type='checkbox' value='1' />&nbsp;&nbsp;
      (additionally to manually shortcoded Podlove Web Players, if both are present)";
  }

function podlovewebplayer_enclosure_richplayer() { 
    $options = get_option('podlovewebplayer_options');
    $checked = "";
    if ( isset( $options['enclosure_richplayer'] ) )
      $checked = "checked ";
    print "<input id='pwpenclosures3' name='podlovewebplayer_options[enclosure_richplayer]' 
      $checked type='checkbox' value='1' />&nbsp;&nbsp;
      (Use advanced player for enclosures)";
  }


function podlovewebplayer_enclosure_bottom() { 
    $options = get_option('podlovewebplayer_options');
    $checked = "";
    if ( isset( $options['enclosure_bottom'] ) )
      $checked = "checked ";
    print "<input id='pwpenclosures4' name='podlovewebplayer_options[enclosure_bottom]' 
      $checked type='checkbox' value='1' />&nbsp;&nbsp;
      (instead of the top)";
  }

function podlovewebplayer_info() {
    $scriptname = explode('/wp-admin', $_SERVER["SCRIPT_FILENAME"]);
    $dirname    = explode('/wp-content', dirname(__FILE__));
    print "<p>This is <strong>Version 2.0.1</strong> of the <strong>Podlove Web Player</strong>.<br>
    The <strong>Including file</strong> is: <code>wp-admin".$scriptname[1]."</code><br>
    The <strong>PWP-directory</strong> is: <code>wp-content".$dirname[1]."</code></p>";
  }



if ( is_admin() ){
  add_action( 'admin_menu', 'podlovewebplayer_create_menu' );
  add_action( 'admin_init', 'podlovewebplayer_register_settings' );
}

?>