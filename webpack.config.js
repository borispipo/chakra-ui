// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const isNonNullString = x=> x && typeof x =='string';
const isValidEnvironment = x=> isNonNullString(x) && (x =='production' || x =='development')

module.exports = function(webpackEnv,opts) {
  opts = opts && typeof opts =="object"? opts : {};
  const mode = opts.mode = isValidEnvironment(opts.mode)? opts.mode : isValidEnvironment(process.env.NODE_ENV)?process.env.NODE_ENV : 'development';
  const imageInlineSizeLimit = typeof opts.imageInlineSizeLimit =='number' && opts.imageInlineSizeLimit || parseInt(
      process.env.IMAGE_INLINE_SIZE_LIMIT  || '10000'
  );
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === 'true' || opts.sourceMap;
  const shouldUseReactRefresh = process.env.FAST_REFRESH;
  const isEnvProduction = mode === 'production';
  const isEnvDevelopment = !isEnvProduction;
  const dir = path.resolve(__dirname);
  const root = path.resolve(dir,"..");
  const base = opts.base = isNonNullString(opts.base) && fs.existsSync(opts.base) && opts.base || dir;
  const babelOptions = require("./babel.config.options")(opts);

  const nodeModulesPath =[
    path.resolve(dir, 'node_modules'),
    path.resolve(root, 'node_modules'), 
    'node_modules',
    ...(Array.isArray(opts.nodeModulesPath)? opts.nodeModulesPath : [])
  ]
  const fConsultPaths = {};
  const ftoConsultPath = [];
  nodeModulesPath.map((p)=>{
    if(isNonNullString(p) && fs.existsSync(p) && fs.existsSync(p)){
        const pp = path.join(path.resolve(p),"@fto-consult");
        if(fs.existsSync(pp) && !fConsultPaths[pp]){
          fConsultPaths[pp] = true;
          ftoConsultPath.push(pp);
        }
    }
  })
  const plugins = Array.isArray(opts.plugins)? opts.plugins : [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
  ];
  const {parsed,...dotEnvParsed} = require('dotenv').config({ path: __dirname + '/.env' });
  plugins.push(new webpack.DefinePlugin({
    'process' : JSON.stringify(dotEnvParsed),
    'process.env': JSON.stringify(parsed),
    'process.env.NODE_ENV': JSON.stringify(mode),
  }));
  return {
    mode,
    devtool: !isEnvProduction && "cheap-module-source-map",
    entry: opts.entry || "./src/index.js",
    output: opts.output || {
      filename: "index.js",
      path: path.resolve(__dirname, "dist"),
    },
    plugins:plugins.filter(Boolean),
    resolve : {
      modules : nodeModulesPath,
      extensions: [...(Array.isArray(opts.sourceExts)? opts.sourceExts:[]),".js", ".jsx",'jsx', 'js','tsx']
    },
    cache: typeof opts.cache =='boolean'? opts.cache : false,
    module : {
      rules:  [
        // Handle node_modules packages that contain sourcemaps
        shouldUseSourceMap && {
          enforce: 'pre',
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|mjs|jsx|ts|tsx|css)$/,
          loader: require.resolve('source-map-loader'),
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // TODO: Merge this config once `image/avif` is in the mime-db
            // https://github.com/jshttp/mime-db
            {
              test: [/\.avif$/],
              type: 'asset',
              mimetype: 'image/avif',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit,
                },
              },
            },
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit,
                },
              },
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: require.resolve('@svgr/webpack'),
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }],
                    },
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: require.resolve('file-loader'),
                  options: {
                    name: 'static/media/[name].[hash].[ext]',
                  },
                },
              ],
              issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
              },
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: [
                dir,
                base,
                ...ftoConsultPath,
              ],
              exclude:[
                /node_modules[/\\](?!@fto-consult|)/,
              ],
              loader: require.resolve('babel-loader'),
              options: {
                ...babelOptions,                
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: isEnvProduction,
              },
            },
            {
              test: /\.s[ac]ss$/i,
              use: [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                "css-loader",
                // Compiles Sass to CSS
                "sass-loader",
              ],
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ].filter(Boolean)
    },
    devServer: {
      static: {
        directory: path.join(dir, 'dist'),
      },
      //compress: true,
      host: '0.0.0.0',
      port: 3000,
      ...(opts.devServer && typeof (opts.devServer) =='object' && !Array.isArray(opts.devServer) && opts.devServer || {})
  },
  };
};