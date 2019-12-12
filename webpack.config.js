const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  mode: "development",
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "[name].[hash].js",
    path: path.resolve("./public"),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader?compact=false"
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              quality: 50,
              name: "./images/[name].[ext]"
            },
          }
        ],
      },
    ]
  },
  externals: {

  },
  
  resolve: {
    extensions: [".js", ".jsx", ".scss"],
  },
  devtool: "inline-source-map",

  devServer: {
    contentBase: path.join('./public'),
    compress: true,
    port: 9001,
    historyApiFallback: true
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ],
};

module.exports = config;