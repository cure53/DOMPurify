const paths = require('./paths');

const umdConfig = {
   devtool: 'source-map',
   output: {
      library: 'DOMPurify',
      libraryTarget: 'umd',
      path: paths.distUmd
   }
};

module.exports = umdConfig;
