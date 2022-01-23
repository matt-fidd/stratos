'use strict';

// Import required modules
const express = require('express');
const session = require('express-session');

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
