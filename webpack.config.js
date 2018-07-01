const path = require('path')

module.exports = {
	target: 'node',
	mode: 'production',
	entry: {
		handler: './handler'
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: __dirname,
				exclude: /node_modules/,
				query: {
					presets:['es2017'],
					plugins: ["transform-runtime"],
				}
			}
		]
	},
	optimization: {
		nodeEnv: 'production',
		mergeDuplicateChunks: true,
		removeAvailableModules: true,
		removeEmptyChunks: true
	}
};