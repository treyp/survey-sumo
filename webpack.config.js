var webpack = require('webpack');

var ENV = process.env.NODE_ENV || 'production';

var config = {
  entry: {
    home: __dirname + '/public/home.js',
    admin: __dirname + '/public/admin.js'
  },
  output: {
    path: __dirname + '/public/builds',
    filename: '[name]-bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel?presets[]=react,presets[]=es2015'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"' + ENV + '"'
    })
  ]
};

if (ENV === 'production') {
  config.plugins.push(new webpack.optimize.DedupePlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    compress: {
      warnings: false
    }
  }));
}

module.exports = config;
