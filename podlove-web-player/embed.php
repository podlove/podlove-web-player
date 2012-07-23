<!doctype html>
<html <?php language_attributes(); ?> class="podlove-web-player-embed">
  <head>
    <meta charset="<?php bloginfo('charset'); ?>">

    <meta name="viewport" content="height=device-height, width=device-width">

    <title><?php wp_title(); ?> <?php bloginfo('name'); ?></title>

    <base href="<?php echo PODLOVEWEBPLAYER_DIR; ?>">

    <meta name="robots" content="noindex,follow">

    <link rel="stylesheet" href="style/main.css">
    <link rel="stylesheet" href="style/embed.css">

    <script src="libs/jquery-1.7.2.js"></script>
    <script src="mediaelement/mediaelement-and-player.min.js"></script>
    <script src="podlove-web-player.js"></script>

    <!-- CSS Helpers -->
    <style>.ir{border:0;font:0/0 a;text-shadow:none;color:transparent;background-color:transparent}.hidden{display:none!important;visibility:hidden}.visuallyhidden{border:0;clip:rect(0000);height:1px;overflow:hidden;position:absolute;width:1px;margin:-1px;padding:0}.visuallyhidden.focusable:active,.visuallyhidden.focusable:focus{clip:auto;height:auto;overflow:visible;position:static;width:auto;margin:0}.invisible{visibility:hidden}.clearfix:before,.clearfix:after{content:"";display:table}.clearfix:after{clear:both}.clearfix{*zoom:1}</style>
  </head>

  <body class="podlove-web-player-embed">
      <?php echo $mediahtml; ?>
  </body>
</html>