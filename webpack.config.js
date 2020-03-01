const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const getMode = env => {
  if (env.production) {
    return 'production'
  }
  return 'development'
}
const getPlugins = env => {
  const plugins = [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
    // new ForkTsCheckerWebpackPlugin()
  ]

  if (!env.production) {
    // plugins.unshift(
    //   new webpack.SourceMapDevToolPlugin({
    //     filename: '[file].map',
    //     append: '\n//# sourceMappingURL=[url]'
    //   })
    // )
    plugins.push(
      new CopyWebpackPlugin([
        {
          context: './src/game/',
          from: '*.html',
          to: './'
        },
        {
          context: './src/maps/',
          from: '*.osm',
          to: './'
        }
      ])
    )
  }

  return plugins
}

module.exports = env => {
  if (env === undefined) {
    env = { development: true }
  }

  const config = {
    entry: {
      main: './src/game/index.tsx',
      'terrain.worker': './src/terrainGeneration/worker.ts'
    },
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist')
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist')
    },
    devtool: 'cheap-module-source-map',
    mode: getMode(env),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: path.join(__dirname, 'src'),
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              projectReferences: true
            }
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                attrs: ['link:href']
                // minimize: true,
                // removeComments: true,
                // collapseWhitespace: true
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ]
        },
        {
          test: /\.osm$/,
          use: {
            loader: 'raw-loader'
          }
        }
      ]
    },
    plugins: getPlugins(env),
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    }
  }

  return config
}
