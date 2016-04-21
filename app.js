var path = require('path');
var fs = require('fs');
var express = require('express');
var config = require('./config');

var app = express();
var compiler;

// very basic views and template handling
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', function readTemplate(filePath, locals, callback) {
  fs.readFile(filePath, function handleTemplate(err, content) {
    if (err) {
      return callback(new Error(err));
    }

    return callback(
      null,
      // replace {var} with locals.var
      content.toString().replace(/{(\w+)}/g, function replaceVars(match, name) {
        if (locals[name] && typeof locals[name] !== 'string') {
          return JSON.stringify(locals[name]);
        }

        return locals[name];
      })
    );
  });
});

// static assets
if (process.env.NODE_ENV === 'development') {
  compiler = require('webpack')(require('./webpack.config'));
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: '/js',
    noInfo: true
  }));
} else {
  app.use('/js', express.static(path.join(__dirname, 'public/builds')));
}
app.use('/css', express.static(path.join(__dirname, 'public/styles')));

// hook up routes to controllers and their middleware
require('./controllers/home')(app);
require('./controllers/admin')(app);

// start the web server
app.listen(config.PORT, function listenComplete() {
  console.log('NODE_ENV is ' + process.env.NODE_ENV);
  console.log('Listening at http://localhost:' + config.PORT);
});
