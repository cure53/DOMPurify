const path = require('path');

const root = path.join(__dirname, '..');
const pkg = 'purify';

const paths = {
   root,
   pkg,
   main: path.join(root, 'src', `${pkg}.js`),
   source: path.join(root, 'src'),
   tests: path.join(root, 'tests'),
   distUmd: path.join(root, 'dist')
};

module.exports = paths;
