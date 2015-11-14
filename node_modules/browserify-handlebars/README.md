#browserify-handlebars

A browserify transform for handlebar templates! Yay!

###Installation:

`npm install browserify-handlebars`

###Usage:

Make a handlebars template like so:

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }}</title>
</head>
<body>
<p>Hello there, {{name}}</p>
</body>
</html>
```

Now `require()` the handlebar template file in code like so:

```javascript
var aTemplateFunction = require('./template.handlebars');

var html = aTemplateFunction({title: "An instantiated template!", name: "David"});
```

and run browserify with the transform option:

`browserify -t browserify-handlebars entry-point.js`

That's all!

## Implementation details

This transform module packages the handlebars templates with the handlebars runtime, which is smaller than the complete handlebars library. This is good, because it means smaller bundle files for you.



