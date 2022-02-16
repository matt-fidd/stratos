'use strict';

// Import required modules
const del = require('del');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));

// Set src and destination paths for css compilation
const src = 'src/stylesheets/main.scss';
const dest = 'public/css';

// Task to compile and optimise css from sass file
gulp.task('styles', () => {
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

	return gulp.src(src)
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(plugins))
		.pipe(gulp.dest(dest));
});

// Task to clean up the destination directory
gulp.task('clean', () => {
	return del([
		dest
	]);
});

// When called with no task, clean the destination, and then compile styles
gulp.task('default', gulp.series([ 'clean', 'styles' ]));

// Task to watch for changes in sass files, then compile on changes
gulp.task('watch', () => {
	gulp.watch('src/stylesheets/**/*.scss', (done) => {
		gulp.series([ 'clean', 'styles' ])(done);
	});
});
