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
const importJSON = require('./lib/importJSON');


/**
 * loadRoutes() Loads all of the routes from /routers into a map
 *
 * @return {Map<String, Object>} Map of all of the routes
 */
function loadRoutes() {
	// Load route files
	const routes = new Map();

	const routeFiles =
		fs.readdirSync(path.join(__dirname, 'routes'))
			.filter(file => file.endsWith('.js'));

	for (const file of routeFiles) {
		const route = require(path.join(__dirname, 'routes', file));
		routes.set(route.root, route.router);
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
			extname: '.hbs'
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

	app.get('/admin/*', (req, res, next) => {
		req.app.locals.layout = 'admin';
		next();
	});

	for (const [ root, router ] of loadRoutes().entries())
		app.use(root, router);

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
