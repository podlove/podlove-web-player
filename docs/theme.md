---
layout: page
title: Theming
navigation: 3
---

# Theming

<p id="example"></p>
<script type="text/javascript" src="https://cdn.rawgit.com/DavidDurman/FlexiColorPicker/ed85fa3c/colorpicker.min.js"></script>
<link rel="stylesheet" href="https://cdn.rawgit.com/DavidDurman/FlexiColorPicker/ed85fa3c/themes.css">
<script src="{{ 'embed.js' | relative_url }}"></script>
<script>
  var theme = {
      main: '#2B8AC6'
  };

  function setThemeConfig(theme) {
      var themeConfig = document.getElementById('theme-config');
      var config = [
        '{\n',
        '    theme: {\n'
      ];

      if (theme.main) {
          config.push('       main: "' + theme.main + '"');
      }

      if (theme.highlight) {
          config.push(',\n');
          config.push('       highlight: "' + theme.highlight + '"');
      }

      config.push('\n');
      config.push('    }\n');
      config.push('  }');

      themeConfig.textContent = config.join('');
  }


  function colorPicker(store) {

      ColorPicker(
      document.getElementById('main-picker'),
      function (hex) {
          theme.main = hex;

          setThemeConfig(theme);
          store.dispatch({
              type: 'SET_THEME',
              payload: theme
          })
      });

      ColorPicker(
      document.getElementById('highlight-picker'),
      function (hex) {
          theme.highlight = hex;

          setThemeConfig(theme);
          store.dispatch({
              type: 'SET_THEME',
              payload: theme
          })
      });
  }

  podlovePlayer('#example', './fixtures/example.json')
      .then(colorPicker);

</script>

<p>
<pre id="theme-config">
  {
    theme: {
      main: "#2B8AC6"
    }
  }
</pre>
</p>

<div class="container">
    <div class="row">
        <div class="column">
            <h4>Main Color:</h4>
            <div id="main-picker" class="cp-small color-picker"></div>
        </div>
        <div class="column">
            <h4>Highlight Color:</h4>
            <div id="highlight-picker" class="cp-small color-picker"></div>
        </div>
    </div>
</div>

## Color Calculation

The player requires at least one main color. If not provided the default color will be used.
Without setting a highlight color the essential control elements are colored black or white depending on a calculated [WCGA contrast ratio](https://www.w3.org/TR/WCAG20/#contrast-ratiodef).
With a highlight color in place these control elements will be colored accordingly.
