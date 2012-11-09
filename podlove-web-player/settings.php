<?php function podlove_pwp_settings_page() { ?>

<div class="wrap">
<h2>Podlove Web Player Options</h2>

<p>See <a href="http://mediaelementjs.com/">MediaElementjs.com</a> for more details on how the HTML5 player and Flash fallbacks work.</p>

<form method="post" action="options.php">
<?php wp_nonce_field('update-options'); ?>

  <table class="widefat fixed">
    <thead>
      <tr class="title">
        <th scope="col" class="manage-column">General Settings</th>
        <th scope="col" class="manage-column"></th>
      </tr>
    </thead>
    <tbody>
    <tr class="mainrow">
      <th scope="titledesc">
        <label for="pwp_script_on_demand">Load script on demand:</label>
      </th>
      <td class="forminp">
        <input name="pwp_script_on_demand" type="checkbox" id="pwp_script_on_demand" <?php echo (get_option('pwp_script_on_demand') == true ? "checked" : "")  ?>>
      </td>
    </tr>
  </tbody>
  </table>

  <table class="widefat fixed" style="margin-top: 20px">
    <thead>
      <tr class="title">
        <th scope="col" class="manage-column">Enclosures</th>
        <th scope="col" class="manage-column"></th>
      </tr>
    </thead>
    <tbody>
    <tr class="mainrow">
      <th scope="row">
        <label for="pwp_enclosure_detect">Turn enclosures to players:</label><br>
        <small>WordPress automatically creates an "enclosure" custom field whenever it detects an URL to a media file in the post text. 
      Use this option to turn these enclosures into Podlove Web Player instances.</small>
      </th>
      <td>
        <input name="pwp_enclosure_detect" type="checkbox" id="pwp_enclosure_detect" <?php echo (get_option('pwp_enclosure_detect') == true ? "checked" : "")  ?>>
      </td>
    </tr>
    <tr valign="top">
      <th scope="row">
        <label for="pwp_enclosure_force">Force enclosure players:</label><br>
        <small>(additionally to regular Podlove Web Players, if both are present)</small>
      </th>
      <td>
        <input name="pwp_enclosure_force" type="checkbox" id="pwp_enclosure_force" <?php echo (get_option('pwp_enclosure_force') == true ? "checked" : "")  ?>>
      </td>
    </tr>
    <tr valign="top">
      <th scope="row">
        <label for="pwp_enclosure_bottom">Put player to bottom of post</label><br>
        <small>(instead of the top)</small>
      </th>
      <td>
        <input name="pwp_enclosure_bottom" type="checkbox" id="pwp_enclosure_bottom" <?php echo (get_option('pwp_enclosure_bottom') == true ? "checked" : "")  ?>>
      </td>
    </tr>
    </tbody>
  </table>

  <script>
    jQuery('#pwp_enclosure_detect').change(function(){
      if (this.checked == false) {
        jQuery('#pwp_enclosure_force')[0].checked = false;
      }
    });
  </script>


  <table class="widefat fixed" style="margin-top: 20px">
    <thead>
      <tr class="title">
        <th scope="col" class="manage-column">Video settings</th>
        <th scope="col" class="manage-column"></th>
      </tr>
    </thead>
    <tbody>
    <tr valign="top">
      <th scope="row">
        <label for="pwp_default_video_width">Default width:</label>
      </th>
      <td>
        <input name="pwp_default_video_width" id="pwp_default_video_width" value="<?php echo get_option('pwp_default_video_width'); ?>"> <span class="description">such as "640"</span>
      </td>
    </tr>
    <tr valign="top">
      <th scope="row">
        <label for="pwp_default_video_height">Default height:</label>
      </th>
      <td>
        <input name="pwp_default_video_height" id="pwp_default_video_height" value="<?php echo get_option('pwp_default_video_height'); ?>"> <span class="description">such as "360"</span>
      </td>
    </tr>
    <tr valign="top">
      <th scope="row">
        <label for="pwp_default_video_type">Default type:</label>
      </th>
      <td>
        <input name="pwp_default_video_type" id="pwp_default_video_type" value="<?php echo get_option('pwp_default_video_type'); ?>"> <span class="description">such as "video/mp4"</span>
      </td>
    </tr>
  </tbody>
  </table>


  <table class="widefat fixed" style="margin-top: 20px">
    <thead>
      <tr class="title">
        <th scope="col" class="manage-column">Audio settings</th>
        <th scope="col" class="manage-column"></th>
      </tr>
    </thead>
    <tbody>
    <tr valign="top">
      <th scope="row">
        <label for="pwp_default_audio_width">Default width:</label>
      </th>
      <td>
        <input name="pwp_default_audio_width" id="pwp_default_audio_width" value="<?php echo get_option('pwp_default_audio_width'); ?>" /> <span class="description">such as "400" (keep blank for auto)</span>
      </td>
    </tr>
    <tr valign="top">
      <th scope="row">
        <label for="pwp_default_audio_height">Default height:</label>
      </th>
      <td>
        <input name="pwp_default_audio_height" id="pwp_default_audio_height" value="<?php echo get_option('pwp_default_audio_height'); ?>" /> <span class="description">stick to "30" if unsure</span>
      </td>
    </tr>
      <th scope="row">
        <label for="pwp_default_audio_type">Default type:</label>
      </th>
      <td>
        <input name="pwp_default_audio_type" id="pwp_default_audio_type" value="<?php echo get_option('pwp_default_audio_type'); ?>" /> <span class="description">such as "audio/mp3"</span>
      </td>
    </tr>
  </tbody>
  </table>

  <input type="hidden" name="action" value="update">
  <input type="hidden" name="page_options" value="pwp_default_video_width,pwp_default_video_height,pwp_default_video_type,pwp_default_audio_type,pwp_default_audio_width,pwp_default_audio_height,pwp_video_skin,pwp_script_on_demand,pwp_enclosure_detect,pwp_enclosure_force,pwp_enclosure_bottom,pwp_allow_embedding">

  <p>
    <input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>">
  </p>

</form>

</div>

<?php } ?>