const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./app.js",
    mode: argv.mode === "production" ? "production" : "development",
    output: {
      filename: isProduction ? "smiles-drawer.min.js" : "smiles-drawer.js",
      path: path.resolve(__dirname, "dist"),
      library: "SmilesDrawer", // Change this according to your library name if needed
      libraryTarget: "umd",
    },
    devServer: {
      static: path.join(__dirname, "dist"),
      historyApiFallback: true,
      compress: true,
      port: 7020,
    },
    devtool: isProduction ? "source-map" : "inline-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      chrome: "65",
                    },
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
        },
        {
          test: /\.ts?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: { extensions: [".tsx", ".ts", ".js"] },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            mangle: false,
          },
        }),
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "example/index.html",
        inject: true,
      }),
    ],
  };
};
