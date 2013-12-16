/*
 *
 * Name: ColorConverter.js
 * By: Simon Waldherr
 * Version: 0.05
 * License: MIT || BSD
 * Repo: github.com/SimonWaldherr/ColorConverter.js
 *
 */

var convRGBtoHSL = function(RGB) {
  "use strict";
  var r = Math.max(Math.min(parseInt(RGB[0], 10) / 255, 1), 0),
      g = Math.max(Math.min(parseInt(RGB[1], 10) / 255, 1), 0),
      b = Math.max(Math.min(parseInt(RGB[2], 10) / 255, 1), 0),
      max = Math.max(r, g, b), 
      min = Math.min(r, g, b),
      d, h, s, l = (max + min) / 2;
  if(max !== min) {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if(max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h = h / 6;
  } else {
    h = s = 0;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

var convHSLtoRGB = function(HSL) {
  "use strict";
  var h = Math.max(Math.min(parseInt(HSL[0], 10), 360), 0) / 360,
      s = Math.max(Math.min(parseInt(HSL[1], 10), 100), 0) / 100,
      l = Math.max(Math.min(parseInt(HSL[2], 10), 100), 0) / 100,
      v, min, sv, six, fract, vsfract, r, g, b;
  if (l <= 0.5) {
    v = l * (1 + s);
  } else {
    v = l + s - l * s;
  }
  if(v === 0) {
    return [0, 0, 0];
  }
  min = 2 * l - v;
  sv = (v - min) / v;
  h = 6 * h;
  six = Math.floor(h);
  fract = h - six;
  vsfract = v * sv * fract;
  switch(six) {
    case 1:
      r = v - vsfract;
      g = v;
      b = min;
      break;
    case 2:
      r = min;
      g = v;
      b = min + vsfract;
      break;
    case 3:
      r = min;
      g = v - vsfract;
      b = v;
      break;
    case 4:
      r = min + vsfract;
      g = min;
      b = v;
      break;
    case 5:
      r = v;
      g = min;
      b = v - vsfract;
      break;
    default:
      r = v;
      g = min + vsfract;
      b = min;
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};


var convRGBtoCMYK = function (RGB) {
  "use strict";
  var red = Math.max(Math.min(parseInt(RGB[0], 10), 255), 0),
      green = Math.max(Math.min(parseInt(RGB[1], 10), 255), 0),
      blue = Math.max(Math.min(parseInt(RGB[2], 10), 255), 0),
      cyan = 1 - red,
      magenta = 1 - green,
      yellow = 1 - blue,
      black = 1;
  if (red || green || blue) {
    black = Math.min(cyan, Math.min(magenta, yellow));
    cyan = (cyan - black) / (1 - black);
    magenta = (magenta - black) / (1 - black);
    yellow = (yellow - black) / (1 - black);
  } else {
    black = 1;
  }
  return [Math.round(cyan*255), Math.round(magenta*255), Math.round(yellow*255), Math.round(black+254)];
};

var convCMYKtoRGB = function (CMYK) {
  "use strict";
  var cyan = Math.max(Math.min(parseInt(CMYK[0], 10) / 255, 1), 0),
      magenta = Math.max(Math.min(parseInt(CMYK[1], 10) / 255, 1), 0),
      yellow = Math.max(Math.min(parseInt(CMYK[2], 10) / 255, 1), 0),
      black = Math.max(Math.min(parseInt(CMYK[3], 10) / 255, 1), 0),
      red = (1 - cyan * (1 - black) - black),
      green = (1 - magenta * (1 - black) - black),
      blue = (1 - yellow * (1 - black) - black);
    return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
};

var convHEXtoRGB = function(hex) {
  "use strict";
  if((hex.length < 2)||(hex.length > 6)) {
    return false;
  }
  var values = hex.split(''),
      r, g, b;
  if(hex.length === 2) {
    r = parseInt(values[0].toString() + values[1].toString(), 16);
    g = r;
    b = r;
  } else if(hex.length === 3) {
    r = parseInt(values[0].toString(), 16);
    g = parseInt(values[1].toString(), 16);
    b = parseInt(values[2].toString(), 16);
  } else if(hex.length === 6) {
    r = parseInt(values[0].toString() + values[1].toString(), 16);
    g = parseInt(values[2].toString() + values[3].toString(), 16);
    b = parseInt(values[4].toString() + values[5].toString(), 16);
  } else {
    return false;
  }
  return [r, g, b];
};

var convRGBtoHEX = function(RGB) {
  "use strict";
  var hexr = Math.max(Math.min(parseInt(RGB[0], 10), 255), 0),
      hexg = Math.max(Math.min(parseInt(RGB[1], 10), 255), 0),
      hexb = Math.max(Math.min(parseInt(RGB[2], 10), 255), 0);
  hexr = hexr > 15 ? hexr.toString(16) : '0'+hexr.toString(16);
  hexg = hexg > 15 ? hexg.toString(16) : '0'+hexg.toString(16);
  hexb = hexb > 15 ? hexb.toString(16) : '0'+hexb.toString(16);
  return hexr+hexg+hexb;
};

var convRGBtoYUV = function(RGB) {
  "use strict";
  var r = parseInt(RGB[0], 10),
      g = parseInt(RGB[1], 10),
      b = parseInt(RGB[2], 10),
      y, u, v;
  y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  u = Math.round((((b - y) * 0.493)+111)/222*255);
  v = Math.round((((r - y) * 0.877)+155)/312*255);
  return [y, u, v];
};

var convYUVtoRGB = function(YUV) {
  "use strict";
  var y = parseInt(YUV[0], 10),
      u = parseInt(YUV[1], 10)/255*222-111,
      v = parseInt(YUV[2], 10)/255*312-155,
      r, g, b;
  r = Math.round(y + v / 0.877);
  g = Math.round(y - 0.39466 * u - 0.5806 * v);
  b = Math.round(y + u / 0.493);
  return [r, g, b];
};

var convRGBtoHSV = function(RGB) {
  "use strict";
  var r = parseInt(RGB[0], 10) / 255,
      g = parseInt(RGB[1], 10) / 255,
      b = parseInt(RGB[2], 10) / 255,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      v = max,
      h, s;
  if(max === 0) {
    s = 0;
  } else {
    s = d / max;
  }
  if(max === min) {
    h = 0;
  } else {
    switch(max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h / 6;
  }
  return [h, s, v];
};

var convHSVtoRGB = function(HSV) {
  "use strict";
  var r, g, b,
      h = HSV[0],
      s = HSV[1],
      v = HSV[2],
      i = Math.floor(h * 6),
      f = h * 6 - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s);
  switch(i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return [r * 255, g * 255, b * 255];
};

var convHSLtoHEX = function(HSL) {
  "use strict";
  return convRGBtoHEX( convHSLtoRGB( HSL ) );
};

var convHEXtoHSL = function(hex) {
  "use strict";
  return convRGBtoHSL( convHEXtoRGB( hex ) );
};