'use strict';

const express = require('express');
const router = express.Router();

const Account = require('../lib/Account');
const User = require('../lib/User');
const validator = require('../lib/validator');

router.get('/', (req, res) => {
	return res.render('index', {
		title: 'Stratos - Home'
	});
});

router.get('/login', (req, res) => {
	if (req.session.authenticated)
		return res.redirect('/admin');

	return res.render('login', {
		title: 'Stratos - Login'
	});
});

router.get('/register', (req, res) => {
	return res.render('register', {
		title: 'Stratos - Register'
	});
});

router.get('/password-reset', (req, res) => {
	return res.render('password-reset', {
		title: 'Stratos - Password Recovery'
	});
});

router.get('/logout', (req, res) => {
	if (!req.session.authenticated)
		return res.redirect('/login');

	return res.render('logout', {
		title: 'Stratos - Logout',
		username: req.session.fullName
	});
});

router.post('/logout', (req, res) => {
	if (req.session.authenticated)
		req.session.destroy();

	return res.redirect('/login');
});

router.post('/login', async (req, res) => {
	let fields;

	try {
		fields = validator.validate(req.body,
			[
				'email',
				'password'
			],
			{
				email: 'email',
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.status(400).json({ status: 'Invalid' });
	}

	const u = await User.getUserByEmail(fields.get('email')) ?? false;

	if (!u)
		return res.redirect('/login');

	if (await u.verifyPassword(fields.get('password'))) {
		u.login(req);
		return res.redirect('/admin');
	}

	return res.redirect('/login');
});

router.post('/register', async (req, res) => {
	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'fname',
				'lname',
				'email',
				'password',
				'confPassword'
			],
			{
				email: 'email',
				password: [ 'password', 'confPassword' ]
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.status(400).json({ status: 'Invalid' });
	}

	let a;
	try {
		a = await Account.createAccount(
			fields.get('fname'),
			fields.get('onames'),
			fields.get('lname'),
			fields.get('email'),
			fields.get('password')
		);
	} catch (e) {
		console.error(e);
		return res.render('error', {
			code: 400,
			msg: 'Unable to create account'
		});
	}

	a.login(req);

	return res.redirect('/login');
});

router.post('/password-reset', async (req, res) => {
	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'email'
			],
			{
				email: 'email'
			}
		).fields;
	} catch (e) {
		console.error(e);
	}

	const u = await User.getUserByEmail(fields.get('email')) ?? false;

	if (!u)
		return res.redirect('/password-reset');

	const pr = await u.generatePasswordReset();

	console.log(`https://stratos.heliumdev.uk/password-reset/${pr.userId}/${encodeURIComponent(pr.token)}`);

	return res.redirect('./login');
});

module.exports = {
	root: '/',
	router: router
};
