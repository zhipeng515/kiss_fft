const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'development',

    entry: './src/kiss_fft.ts',
    output: {
        filename: 'kiss_fft.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'kiss_fft',
        libraryTarget: "commonjs"
    },
    // optimization: {
    //     minimizer: [
    //       new TerserPlugin({
    //         terserOptions: {
    //           ecma: undefined,
    //           warnings: false,
    //           parse: {},
    //           compress: {
    //             warnings: false,
    //             drop_console: true,
    //             drop_debugger: true,
    //             collapse_vars: true,
    //             reduce_vars: true,
    //             pure_funcs: ['console.log']
    //           },
    //           mangle: true, // Note `mangle.properties` is `false` by default.
    //           module: false,
    //           output: {
    //             beautify: false,
    //             comments: false,
    //           },
    //           toplevel: false,
    //           nameCache: null,
    //           ie8: false,
    //           keep_classnames: undefined,
    //           keep_fnames: false,
    //           safari10: false,
    //         },
    //       }),
    //     ],
    //   },
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                // 在UglifyJs删除没有用到的代码时不输出警告
                warnings: false,
                compress: {
                    // 删除所有的 `console` 语句，可以兼容ie浏览器
                    drop_console: true,
                    // 内嵌定义了但是只用到一次的变量
                    collapse_vars: true,
                    // 提取出出现多次但是没有定义成变量去引用的静态值
                    reduce_vars: true,
                  },
                  output: {
                    // 最紧凑的输出
                    beautify: false,
                    // 删除所有的注释
                    comments: false,
                  }
                }
        }),
    ],
    
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader"
        }]
    },
    resolve: {
        extensions: [
            '.ts'
        ]
    }
};