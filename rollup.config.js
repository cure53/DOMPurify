const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');

const env = process.env.NODE_ENV

const config = {
  entry: 'src/purify.js',
  external: [],
  globals: {},
  format: 'umd',
  moduleName: 'purify',
  sourceMap: true,
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        warnings: false
      }
    })
  )
}

export default config
