'use strict';

// Import required modules
const bodyParser = require('body-parser');
const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const serveFavicon = require('serve-favicon');
const serveStatic = require('serve-static');

// Import user defined modules
const DatabaseConnectionPool = require('./lib/DatabaseConnectionPool');
const hbsHelpers = require('./lib/handlebarsHelpers.js');
const importJSON = require('./lib/importJSON');


/**
 * loadRoutes() Loads all of the routes from /routers into a map
 *
 * @return {Array<Array<String, Object>>} Map of all of the routes
 */
function loadRoutes() {
	// Load route files
	const routes = [];

	const routeFiles =
		fs.readdirSync(path.join(__dirname, 'routes'))
			.filter(file => file.endsWith('.js'));

	for (const file of routeFiles) {
		const route = require(path.join(__dirname, 'routes', file));
		routes.push([ route.root, route.router ]);
	}

	return routes;
}

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
	app.engine(
		'hbs',
		engine({
			extname: '.hbs',
			helpers: hbsHelpers
		})
	);
	app.set('view engine', 'hbs');
	app.set('views', path.join(__dirname, 'views'));

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

	// Authentication middleware that redirects unauthenticated users
	// back to the login page if they request a page they don't have access
	// to
	app.use((req, res, next) => {
		const allowed = [
			'/login',
			'/register',
			'/password-reset',
			'/change-password',
			'/'
		];

		// Extract the first component of the path from the request
		const path = `/${req.path.split('/')?.[1] ?? ''}`;

		if (!allowed.includes(path) && !req.session.authenticated)
			return res.redirect('/login');

		next();
	});

	app.get('*', (req, res, next) => {
		req.app.locals.layout = 'main';
		next();
	});

	app.get('/admin/*', (req, res, next) => {
		req.app.locals.layout = 'admin';
		next();
	});

	for (const route of loadRoutes())
		app.use(route[0], route[1]);

	// If the request gets to the bottom of the route stack, it doesn't
	// have a defined route and therefore a HTTP status code 404 is sent
	// and an error page shown
	app.use((req, res) => {
		res.status(404).render('error', {
			title: 'Stratos - Error',
			code: 404,
			msg: 'Page Not Found'
		});
	});

	// Start the server
	app.listen(serverOptions.port, () => {
		console.log(`Server listening on :${serverOptions.port}`);
	});
}

main().catch(console.error);
