'use strict';

// Import required modules
const { dest, parallel, series, src, watch }  = require('gulp');
const del = require('del');
const fs = require('fs');
const path = require('path');
const postcss = require('gulp-postcss');
const prompt = require('prompt-sync')({ sigint: true });
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));

const importJSON = require(path.join(__dirname, 'lib', 'importJSON'));

const dbModule = (name) => path.join(__dirname, 'utility/db', name);

const cleanDb = require(dbModule('cleanDb'));
const initDb = require(dbModule('initDb'));
const insertTestData = require(dbModule('insertTestData'));

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

// Clean config dir of all non-sample files
function cleanConfig() {
	const configFiles =
		fs.readdirSync(path.join(__dirname, 'config'))
			.filter(file => !file.endsWith('.sample.json'))
			.map(file => `./config/${file}`);

	return del(configFiles);
}

// Copy all sample files to their non-sample counterpart
function copyConfig() {
	return src('config/*.sample.json')
		.pipe(rename(path => {
			path.basename = path.basename.split('.sample')[0];
		}))
		.pipe(dest('config/'));
}

// Allow user to edit config files
function setConfig(cb) {
	const writeConfig = (file, contents) => {
		console.log(`Writing config to ${file}.json`);

		fs.writeFileSync(
			path.join(__dirname, 'config', `${file}.json`),
			JSON.stringify(contents)
		);
	};

	const configFiles =
		fs.readdirSync(path.join(__dirname, 'config'))
			.filter(file => !file.endsWith('.sample.json'))
			.map(file => file.split('.json')[0]);

	console.log('\nEditing config files');
	console.log('\nWhen prompted for a new value, press enter to keep ' +
		'the existing one');

	for (const file of configFiles) {
		const contents = importJSON(file);

		console.log(`\nConsidering ${file}.json`);
		console.log('Current contents:');
		console.log(contents);

		const answer =
			prompt('Would you like to edit the config? (y/N) ');

		if (answer !== 'y')
			continue;

		for (const [ k, v ] of Object.entries(contents)) {
			let value =
				prompt(` - ${k} (${v}): `).trim();

			if (value.length === 0)
				continue;

			switch (typeof v) {
				case 'number':
					value = Number(value);
					break;
				case 'boolean':
					value = value === 'true';
					break;
			}

			contents[k] = value;
		}

		writeConfig(file, contents);
	}

	cb();
}

// Task to build stylesheet from start to finish
exports.styles = series(cleanStyles, compileStyles);

// Task to watch for changes in sass files, then compile on changes
exports.watchStyles = () => {
	watch('src/stylesheets/**/*.scss', exports.styles);
};

// Create tables and relationships in database
exports.dbInit = initDb;

// Clean all data and insert test data into database
exports.dbTestData = series(initDb, cleanDb, insertTestData);

// Build stylesheet, and generate config files
exports.default =
	parallel(
		exports.styles,
		series(
			cleanConfig,
			copyConfig,
			setConfig
		)
	);
