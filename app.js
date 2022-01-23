'use strict';

// Import required modules
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const session = require('express-session');
const serveFavicon = require('serve-favicon');
const serveStatic = require('serve-static');

// Import user defined modules
const DatabaseConnectionPool = require('./lib/DatabaseConnectionPool');
const importJSON = require('./lib/importJSON');

async function main() {
	// Import config files
	const serverOptions = importJSON('server');
	const sessionOptions = importJSON('session');

	// Set up express-session to store in mysql database
	const mysqlStore = require('express-mysql-session')(session);
	const sessionStore =
		new mysqlStore({},(await new DatabaseConnectionPool()).pool);

	// Initialise express app
	const app = express();

	// Set up templating language and path
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, '/views/pages'));

	// Set up parsers to allow reading of POST form data
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// Set up routes for static files
	app.use(serveFavicon(path.join(__dirname,
		'public/assets/favicon.ico')));
	app.use('/', serveStatic(path.join(__dirname, 'public')));

	// Set up session middleware
	app.use(session({
		secret: sessionOptions.sessionSecret,
		saveUninitialized: false,
		resave: false,
		store: sessionStore,
		cookie: {
			maxAge: sessionOptions.sessionLifetime,
			sameSite: true
		}
	}));

	// Start the server
	app.listen(serverOptions.port, () => {
		console.log(`Server listening on :${serverOptions.port}`);
	});
}

main().catch(console.error);
