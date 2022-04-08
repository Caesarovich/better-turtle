const path = require('path');

module.exports = {
  entry: './dist/index.js',
  mode: 'production',
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'BetterTurtle',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    auxiliaryComment: 'Turtle JS redefined',
  },
};
