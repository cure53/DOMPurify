const paths = require('./paths');

const baseConfig = {
   devtool: 'eval',
   entry: paths.main,
   module: {
      rules: [{
         test: /\.js$/,
         include: /src/,
         use: {
            loader: 'babel-loader',
            options: {
               presets: ['env']
            }
         }
      }]
   },
   output: {
      filename: `${paths.pkg}.js`
   },
   resolve: {},
   plugins: []
};

module.exports = baseConfig;
