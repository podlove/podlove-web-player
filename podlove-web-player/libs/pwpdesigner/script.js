function pwpdbuildcss(color1,color2,color3,gradient) {
  var css, fontcolor = [], color1hsl = [], color2hsl = [], color3hsl = [];
  
  color1hsl = convHEXtoHSL(color1);
  if(color1hsl[2] > 70) {
    fontcolor = [0,0,30];
  } else {
    fontcolor = [0,0,100];
  }
  if((color2 === undefined)||(color2 === false)) {
    color2hsl[0] = color1hsl[0];
    color2hsl[1] = color1hsl[1];
    color2hsl[2] = Math.max(Math.min(color1hsl[2]-(gradient*2), 100), 0);
  } else {
    color2hsl = convHEXtoHSL(color2);
  }
  if((color3 === undefined)||(color3 === false)) {
    color3hsl[0] = color1hsl[0];
    color3hsl[1] = color1hsl[1];
    color3hsl[2] = Math.max(Math.min(color1hsl[2]-(gradient*3), 100), 0);
  } else {
    color3hsl = convHEXtoHSL(color3);
  }
  
  css = ".podlovewebplayer_wrapper{color:#"+convHSLtoHEX(fontcolor)+" !important;}.podlovewebplayer_wrapper .podlovewebplayer_meta,.podlovewebplayer_wrapper .podlovewebplayer_meta .subtitle,.podlovewebplayer_wrapper .podlovewebplayer_meta h3,.podlovewebplayer_wrapper .podlovewebplayer_meta h3 a,.podlovewebplayer_meta + .summary,.podlovewebplayer_wrapper .podlovewebplayer_controlbox,.podlovewebplayer_wrapper .podlovewebplayer_meta .togglers{color:#"+convHSLtoHEX(fontcolor)+" !important;}.podlovewebplayer_wrapper .podlovewebplayer_top,.podlovewebplayer_wrapper .podlovewebplayer_meta{background:#"+convHSLtoHEX(color1hsl)+";background:-moz-linear-gradient(top,#"+convHSLtoHEX(color1hsl)+" 0%,#"+convHSLtoHEX(color2hsl)+" 100%);background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,#"+convHSLtoHEX(color1hsl)+"),color-stop(100%,#"+convHSLtoHEX(color2hsl)+"));background:-webkit-linear-gradient(top,#"+convHSLtoHEX(color1hsl)+" 0%,#"+convHSLtoHEX(color2hsl)+" 100%);background:-o-linear-gradient(top,#"+convHSLtoHEX(color1hsl)+" 0%,#"+convHSLtoHEX(color2hsl)+" 100%);background:-ms-linear-gradient(top,#"+convHSLtoHEX(color1hsl)+" 0%,#"+convHSLtoHEX(color2hsl)+" 100%);background:linear-gradient(to bottom,#"+convHSLtoHEX(color1hsl)+" 0%,#"+convHSLtoHEX(color2hsl)+" 100%);filter:progid:DXImageTransform.Microsoft.gradient( startColorstr='#"+convHSLtoHEX(color1hsl)+"',endColorstr='#"+convHSLtoHEX(color2hsl)+"',GradientType=0 );}.podlovewebplayer_meta .bigplay{color:#"+convHSLtoHEX(fontcolor)+";border-color:#"+convHSLtoHEX(fontcolor)+" !important;}.podlovewebplayer_meta .bigplay:hover,.podlovewebplayer_meta .bigplay:active,.podlovewebplayer_meta .bigplay.playing:hover,.podlovewebplayer_meta .bigplay.playing:active{color:#"+convHSLtoHEX(fontcolor)+" !important;border-color:#"+convHSLtoHEX(fontcolor)+" !important;text-shadow:0px 0px 4px #"+convHSLtoHEX(fontcolor)+";text-decoration:none;filter:dropshadow(color=#"+convHSLtoHEX(fontcolor)+",offx=0,offy=0);cursor:pointer;}.podlovewebplayer_meta .togglers .infobuttons,.podlovewebplayer_meta .togglers .infobuttons a,.podlovewebplayer_wrapper .podlovewebplayer_controlbox .infobuttons,.podlovewebplayer_wrapper .podlovewebplayer_controlbox .infobuttons a{color:#"+convHSLtoHEX(fontcolor)+";text-shadow:0px 0px 1px #"+convHSLtoHEX(fontcolor)+";text-decoration:none;}.podlovewebplayer_meta .togglers .infobuttons:hover,.podlovewebplayer_meta .togglers .infobuttons a:hover,.podlovewebplayer_wrapper .podlovewebplayer_controlbox .infobuttons:hover,.podlovewebplayer_wrapper .podlovewebplayer_controlbox .infobuttons a:hover{text-shadow:0px 0px 4px #"+convHSLtoHEX(fontcolor)+";text-decoration:none;filter:dropshadow(color=#"+convHSLtoHEX(fontcolor)+",offx=0,offy=0);cursor:pointer;}.podlovewebplayer_meta + .summary,.podlovewebplayer_wrapper .podlovewebplayer_controlbox{background:#"+convHSLtoHEX(color2hsl)+" !important;border-left:3px #"+convHSLtoHEX(color2hsl)+" solid !important;border-right:3px #"+convHSLtoHEX(color2hsl)+" solid !important;}.podlovewebplayer_wrapper .podlovewebplayer_controlbox{background:#"+convHSLtoHEX(color3hsl)+" !important;border-left:3px #"+convHSLtoHEX(color3hsl)+" solid !important;border-right:3px #"+convHSLtoHEX(color3hsl)+" solid !important;}.mejs-controls .mejs-play button{background-position:0 0;}.mejs-controls .mejs-pause button{background-position:0 -16px;}.mejs-controls .mejs-stop button{background-position:-112px 0;}.mejs-controls .mejs-fullscreen-button button{background-position:-32px 0;}.mejs-controls .mejs-unfullscreen button{background-position:-32px -16px;}.mejs-controls .mejs-mute button{background-position:-16px -16px;}.mejs-controls .mejs-unmute button{background-position:-16px 0;}.mejs-controls .mejs-captions-button button{background-position:-48px 0;}.mejs-controls .mejs-loop-off button{background-position:-64px -16px;}.mejs-controls .mejs-loop-on button{background-position:-64px 0;}.mejs-controls .mejs-backlight-off button{background-position:-80px -16px;}.mejs-controls .mejs-backlight-on button{background-position:-80px 0;}.mejs-controls .mejs-sourcechooser-button button{background-position:-128px 0;}.podlovewebplayer_wrapper .mejs-container .mejs-inner .mejs-controls{background:#"+convHSLtoHEX(color2hsl)+" !important;background:-moz-linear-gradient(top,#"+convHSLtoHEX(color2hsl)+" 0%,#"+convHSLtoHEX(color3hsl)+" 100%) !important;background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,#"+convHSLtoHEX(color2hsl)+"),color-stop(100%,#"+convHSLtoHEX(color3hsl)+")) !important;background:-webkit-linear-gradient(top,#"+convHSLtoHEX(color2hsl)+" 0%,#"+convHSLtoHEX(color3hsl)+" 100%) !important;background:-o-linear-gradient(top,#"+convHSLtoHEX(color2hsl)+" 0%,#"+convHSLtoHEX(color3hsl)+" 100%) !important;background:-ms-linear-gradient(top,#"+convHSLtoHEX(color2hsl)+" 0%,#"+convHSLtoHEX(color3hsl)+" 100%) !important;background:linear-gradient(to bottom,#"+convHSLtoHEX(color2hsl)+" 0%,#"+convHSLtoHEX(color3hsl)+" 100%) !important;filter:progid:DXImageTransform.Microsoft.gradient( startColorstr='#"+convHSLtoHEX(color2hsl)+"',endColorstr='#"+convHSLtoHEX(color3hsl)+"',GradientType=0 ) !important;}.mejs-container .mejs-controls .mejs-time span{color:#111;}.podlovewebplayer_wrapper .podlovewebplayer_chapterbox{border:3px #"+convHSLtoHEX(color3hsl)+" solid !important;border-bottom:0px #"+convHSLtoHEX(color3hsl)+" solid !important;}.podlovewebplayer_wrapper .podlovewebplayer_tableend{background:#"+convHSLtoHEX(color3hsl)+" !important;-webkit-box-shadow:0px 1px #"+convHSLtoHEX(color3hsl)+";-moz-box-shadow:0px 1px #"+convHSLtoHEX(color3hsl)+";box-shadow:0px 1px #"+convHSLtoHEX(color3hsl)+";}.podlovewebplayer_meta .bigplay, .podlovewebplayer_meta .togglers .infobuttons, .podlovewebplayer_meta .togglers .infobuttons a, .podlovewebplayer_wrapper .podlovewebplayer_controlbox .infobuttons, .podlovewebplayer_wrapper .podlovewebplayer_controlbox .infobuttons a {color:#"+convHSLtoHEX(fontcolor)+" !important;}.podlovewebplayer_wrapper .podlovewebplayer_meta .bigplay {border: 5px solid #"+convHSLtoHEX(fontcolor)+" !important;}.mejs-container .mejs-controls .mejs-time span{color:#"+convHSLtoHEX(fontcolor)+" !important}";
  
  return css;
}

function pwpdcolorize() {
  var hue, sat, lum, css, styleele;
  hue = document.getElementById('hue').value;
  sat = document.getElementById('sat').value;
  lum = document.getElementById('lum').value;
  gra = document.getElementById('gra').value;
  css = pwpdbuildcss(convHSLtoHEX([hue, sat, lum]),false,false,gra);
  if(document.getElementById('pwpdesigner') === null) {
    styleele = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(styleele);
  }
  document.getElementById('pwpdesigner').innerHTML = css;
  document.getElementById('pwpstyle1').innerHTML = css;
  document.getElementById('pwpconsole').value = JSON.stringify({'hue':hue,'sat':sat,'lum':lum,'gra':gra});
}

function pwpdcolorreset() {
  document.getElementById('pwpdesigner').innerHTML = '';
  document.getElementById('pwpstyle1').innerHTML = '';
  document.getElementById('hue').value = 180;
  document.getElementById('sat').value = 0;
  document.getElementById('lum').value = 33;
  document.getElementById('gra').value = 9;
  document.getElementById('pwpconsole').value = '{"hue":180,"sat":0,"lum":33,"gra":9}';
  if(document.getElementById('custom-pwp-style-css') === null) {
    return;
  }
  var customcss = document.getElementById('custom-pwp-style-css');
  customcss.parentNode.removeChild(customcss);
}

function pwpdrandomcolor() {
  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  document.getElementById('hue').value = random(0,360);
  document.getElementById('sat').value = random(0,100);
  document.getElementById('lum').value = random(0,100);
  document.getElementById('gra').value = random(0,20);
  pwpdcolorize();
}

function pwpdinsertcolor() {
  var color = window.prompt('please enter your color', '#545454');
  if(convHEXtoRGB(color.replace('#','')) !== false) {
    color = convRGBtoHSL(convHEXtoRGB(color.replace('#','')));
  } else {
    if(color.indexOf(',') !== -1) {
      color = convRGBtoHSL(color.split(','));
    } else if(color.indexOf(' ') !== -1) {
      color = convRGBtoHSL(color.split(' '));
    } else {
      alert('color not compatible');
      return false;
    }
  }
  document.getElementById('hue').value = color[0];
  document.getElementById('sat').value = color[1];
  document.getElementById('lum').value = color[2];
  document.getElementById('gra').value = 10;
  pwpdcolorize();
}

function pwpdesignerinit() {
  var style, styleele = document.createElement('style');
  styleele.id = 'pwpdesigner';
  document.getElementsByTagName('head')[0].appendChild(styleele);
  style = JSON.parse(document.getElementById('pwpconsole').value);
  document.getElementById('hue').value = style.hue;
  document.getElementById('sat').value = style.sat;
  document.getElementById('lum').value = style.lum;
  document.getElementById('gra').value = style.gra;
  pwpdcolorize();
}

window.onload = pwpdesignerinit;
