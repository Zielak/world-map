const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const getMode = env => {
  if (env.production) {
    return 'production'
  }
  return 'development'
}
const getEntries = env => {
  const entry = {
    main: './src/index.tsx',
    'terrain.worker': './src/terrainGeneration/worker.ts'
  }
  return entry
}
const getPlugins = env => {
  const plugins = []

  if (!env.production) {
    plugins.unshift(
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        append: '\n//# sourceMappingURL=[url]'
      })
    )
    plugins.push(
      new CopyWebpackPlugin([
        {
          context: './src',
          from: '*.html',
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
    entry: getEntries(env),
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist')
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist')
    },
    mode: getMode(env),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'src/tsconfig.json'),
              projectReferences: true
            }
          },
          exclude: /node_modules/
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
