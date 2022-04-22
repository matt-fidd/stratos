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
	return fs.readdirSync(path.join(__dirname, 'routes'))
		.filter(file => file.endsWith('.js'))
		.map(file => {
			const route = require(path.join(
				__dirname,
				'routes',
				file
			));

			return {
				...route,
				filename: file
			};
		})
		.sort((a, b) => {
			if (a.priority > b.priority || b.priority == null)
				return 1;

			if (a.priority < b.priority || a.priority == null)
				return -1;

			return 0;
		});
}

async function main() {
	// Import config files
	const serverOptions = importJSON('server');
	const sessionOptions = importJSON('session');

	const dbp = await new DatabaseConnectionPool();

	// Set up express-session to store in mysql database
	const mysqlStore = require('express-mysql-session')(session);
	const sessionStore = new mysqlStore({}, dbp.pool);

	// Initialise express app
	const app = express();

	// Set up global database pool
	app.use((req, res, next) => {
		req.db = dbp;
		next();
	});

	// Set up templating language and path
	app.engine(
		'hbs',
		engine({
			extname: '.hbs',
			helpers: hbsHelpers,
			runtimeOptions: {
				allowProtoPropertiesByDefault: true,
				allowProtoMethodsByDefault: true
			}
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

	// Generic handlebars context
	app.use((req, res, next) => {
		req.hbsContext = {
			name: req.session?.fullName,
			userType: req.session?.userType,
			title: 'Stratos'
		};

		next();
	});

	/*
	 * Authentication middleware that redirects unauthenticated users
	 * back to the login page if they request a page they don't have access
	 * to
	 */
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
			return res.redirect(`/login?redirect_to=${req.path}`);
		else if (req.path !== '/admin/parent-login' &&
			!allowed.includes(path) &&
			req.session.userType === 'parent'
		)
			return res.redirect('/admin/parent-login');


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
		app.use(route.root, route.router);

	/*
	 * If the request gets to the bottom of the route stack, it doesn't
	 * have a defined route and therefore a HTTP status code 404 is sent
	 * and an error page shown
	 */
	app.use((req, res) => {
		res.status(404).render('error', {
			...req.hbsContext,
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
