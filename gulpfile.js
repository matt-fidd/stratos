const del = require('del');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));

const src = 'src/stylesheets/main.scss';
const dest = 'public/css';

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
		})
	];

	return gulp.src(src)
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(plugins))
		.pipe(gulp.dest(dest));
});

gulp.task('clean', () => {
	return del([
		dest
	]);
});

gulp.task('default', gulp.series([ 'clean', 'styles' ]));

gulp.task('watch', () => {
	gulp.watch('src/stylesheets/**/*.scss', (done) => {
		gulp.series([ 'clean', 'styles' ])(done);
	});
});
