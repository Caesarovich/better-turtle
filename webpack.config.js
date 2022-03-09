const path = require('path');

module.exports = {
  entry: './dist/index.js',
  mode: 'production',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'turtle',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    auxiliaryComment: 'Test Comment',
  },
};
