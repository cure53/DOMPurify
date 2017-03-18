const paths = require('./paths');

const umdConfig = {
   devtool: 'source-map',
   output: {
      library: `${paths.pkg}`,
      libraryTarget: 'umd',
      path: paths.distUmd,
      umdNamedDefine: true
   }
};

module.exports = umdConfig;
