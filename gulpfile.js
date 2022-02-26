'use strict';

// Import required modules
const del = require('del');
const { dest, series, src, watch }  = require('gulp');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));

// Set src and destination paths for css compilation
const cssPaths = {
	src: 'src/stylesheets/main.scss',
	dest: 'public/css'
};

// Compile and optimise css from sass file
function compileStyles() {
	let cssnanoOptions = {
		normalizeWhitespace: false
	};

	if (process.env.NODE_ENV === 'production')
		cssnanoOptions = {};

	const plugins = [
		require('autoprefixer'),
		require('cssnano')({
			preset: [ 'default', cssnanoOptions ]
		}),
		require('postcss-sort-media-queries')
	];

	return src(cssPaths.src)
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(plugins))
		.pipe(dest(cssPaths.dest));
}

// Clean css destination directory
function cleanStyles() {
	return del([ cssPaths.dest ]);
}

// Task to build stylesheet from start to finish
exports.styles = series(cleanStyles, compileStyles);

// Task to watch for changes in sass files, then compile on changes
exports.watchStyles = () => {
	watch('src/stylesheets/**/*.scss', exports.styles);
};
