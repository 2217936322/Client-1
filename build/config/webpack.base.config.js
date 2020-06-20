const path = require('path');
const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WebpackBar = require('webpackbar');
const _get = require('lodash/get');

const buildTemplate = require('./html-template');

const ROOT_PATH = path.resolve(__dirname, '../../');
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');
const DIST_PATH = path.resolve(ROOT_PATH, 'dist');
const CONFIG_PATH = path.resolve(ROOT_PATH, 'config');
const config = require('../../package.json');
const ASSET_PATH = process.env.ASSET_PATH || '/';

const dllConfig = require('./dll/vendor-manifest.json');
const dllHashName = 'dll_' + dllConfig.name; // 用于处理文件的hash使其能在修改后通知html模板也进行变更

/**
 * NOTICE: 移除@babel/plugin-transform-modules-commonjs以应用摇树优化
 * 摇树优化能自动解析@ant-design/icons的图标并按需加载(节约大量空间)
 * --------------------------以上内容忽略---------------
 * 无法移除plugin-transform-modules-commonjs插件。生产环境编译后会出现问题(dev环境没有这个问题)
 * 解决问题前只能统一使用commonjs
 */
const babelQuery = {
  babelrc: false,
  compact: false,
  presets: ['@babel/preset-env', '@babel/preset-react'],
  ignore: [/[\/\\]core-js/, /@babel[\/\\]runtime/],
  sourceType: 'unambiguous', // 如果不加这一行就会抛出一堆warning 因为默认是commonjs
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true,
      },
    ],
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true, // `style: true` 会加载 less 文件
      },
      'antd',
    ],
    [
      'import',
      {
        libraryName: 'react-use',
        libraryDirectory: 'esm',
        camel2DashComponentName: false,
      },
      'react-use',
    ],
    'transform-class-properties',
    '@babel/plugin-transform-modules-commonjs', // NOTICE: 该组件不能移除，因为目前需要require来实现一些异步加载
  ],
};

module.exports = {
  entry: {
    // vendor: vendors,
    app: path.resolve(APP_PATH, './web/index.tsx'),
  },
  output: {
    path: DIST_PATH,
    filename: '[name].[hash].js',
    publicPath: ASSET_PATH,
  },
  resolve: {
    extensions: [
      '.web.js',
      '.mjs',
      '.js',
      '.ts',
      '.json',
      '.web.jsx',
      '.jsx',
      '.web.tsx',
      '.tsx',
    ],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(ROOT_PATH, 'tsconfig.json'),
      }),
    ],
  },
  //babel重要的loader在这里
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: {
                  // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
                  'primary-color': '#8C6244',
                  'error-color': '#e44a4c',
                  'text-selection-bg': '#1890ff',
                },
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            query: babelQuery,
          },
          { loader: 'ts-loader', options: { allowTsInNodeModules: true } },
        ],
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        // include: [
        //   APP_PATH,
        //   CONFIG_PATH,
        //   path.resolve(ROOT_PATH, './node_modules/trpg-actor-template/'),
        //   path.resolve(ROOT_PATH, './node_modules/react-native-storage/'),
        // ],
        exclude: path.resolve(ROOT_PATH, './node_modules/**'),
        query: babelQuery,
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|svg|eot|ttf)$/,
        loader: 'url-loader?limit=8192&name=assets/[name].[hash:7].[ext]',
      },
      {
        test: /\.(txt|xml)$/,
        loader: 'raw-loader',
      },
    ],
  },

  externals: {
    electron: "require('electron')",
    'react-native': "require('react-native')",
    config: JSON.stringify({
      // 手动指定部分配置以防止私密配置泄漏
      sentry: require('config').get('sentry'),
    }), // 用于全局使用config，config由编译时的环境变量指定
  },

  optimization: {
    splitChunks: {
      chunks: 'all', // all, async, initial
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 6,
      maxInitialRequests: 4,
      automaticNameDelimiter: '~',
      automaticNameMaxLength: 30,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10, // 优先级，一个chunk很可能满足多个缓存组，会被抽取到优先级高的缓存组中
          reuseExistingChunk: true, //  如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
          enforce: true, // 如果cacheGroup中没有设置minSize，则据此判断是否使用上层的minSize，true：则使用0，false：使用上层minSize
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  },

  plugins: [
    new WebpackBar({
      name: `🎲  TRPG ${_get(process, 'env.TRPG_APP_NAME', 'Game')}`,
      color: '#8C6244',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        PLATFORM: JSON.stringify(process.env.PLATFORM),
        TRPG_HOST: JSON.stringify(process.env.TRPG_HOST),
        TRPG_PORTAL: JSON.stringify(process.env.TRPG_PORTAL),
      },
    }),
    new webpack.DllReferencePlugin({
      manifest: dllConfig,
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(BUILD_PATH, './template/pre-loading.css'),
        to: 'pre-loading.css',
      },
      {
        from: path.resolve(BUILD_PATH, './config/dll/dll_vendor.js'),
        to: `${dllHashName}.js`,
      },
      {
        from: path.resolve(APP_PATH, './web/assets'),
        to: './src/web/assets',
        ignore: ['fonts/*.html'],
      },
    ]),
    new HtmlwebpackPlugin({
      title: 'TRPG-Game',
      // 手动编译html文件
      templateContent: buildTemplate({
        isDev: _get(process, 'env.NODE_ENV') === 'development',
        isPro: _get(process, 'env.NODE_ENV') === 'production',
        dllHashName,
      }),
      inject: true,
      favicon: path.resolve(APP_PATH, './web/assets/img/favicon.ico'),
      hash: true,
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: [`pre-loading.css?v=${config.version}`],
      append: false,
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
};
