const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/app.js', // Entry point for main JavaScript file
  output: {
    path: path.resolve(__dirname, 'dist'), // Output to 'dist' directory
    filename: 'bundle.js' //  the output filename
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // Handle CSS files
      },
      {
        test: /\.bpmn$/,
        use: 'raw-loader', // Handle BPMN files as raw text
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/index.html', to: 'index.html' } 
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), 
    },
    compress: true,
    port: 9000,
    open: true,
    hot: false
  },
  mode: 'development', 
  devtool: 'source-map' 
};
