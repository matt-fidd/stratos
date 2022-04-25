'use strict';

const express = require('express');
const router = express.Router();

const Account = require('../lib/Account');
const { EmailBuilder, Emailer } = require('../lib/Emailer');
const User = require('../lib/User');
const PasswordReset = require('../lib/PasswordReset');

const validator = require('../lib/validator');

router.get('/', (req, res) => {
	return res.render('index', {
		...req.hbsContext,
		title: 'Stratos - Home'
	});
});

router.get('/login', (req, res) => {
	if (req.session.authenticated)
		return res.redirect('/admin');

	return res.render('login', {
		...req.hbsContext,
		title: 'Stratos - Login',
		redirect_to: req.query?.redirect_to
	});
});

router.get('/register', (req, res) => {
	return res.render('register', {
		...req.hbsContext,
		title: 'Stratos - Register'
	});
});

router.get('/password-reset', (req, res) => {
	return res.render('password-reset', {
		...req.hbsContext,
		title: 'Stratos - Password Recovery'
	});
});

router.get('/logout', (req, res) => {
	return res.render('logout', {
		...req.hbsContext,
		title: 'Stratos - Logout'
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
				email: 'email'
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.status(400).json({ status: 'Invalid' });
	}

	const u = await User.getUserByEmail(
		req.db,
		fields.get('email')
	) ?? false;

	if (!u)
		return res.redirect('/login');

	if (await u.verifyPassword(fields.get('password'))) {
		u.login(req);

		if (fields.get('redirectTo').length > 0)
			return res.redirect(fields.get('redirectTo'));

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
			req.db,
			fields.get('fname'),
			fields.get('onames'),
			fields.get('lname'),
			fields.get('email'),
			fields.get('password')
		);
	} catch (e) {
		console.error(e);
		return res.render('error', {
			...req.hbsContext,
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

	const u = await User.getUserByEmail(
		req.db,
		fields.get('email')
	) ?? false;

	if (!u)
		return res.redirect('/password-reset');

	const pr = await u.generatePasswordReset();
	const URIToken = encodeURIComponent(pr.token);

	const root = 'https://stratos.heliumdev.uk';
	const path = `/password-reset/${pr.userId}/${URIToken}`;
	const url = `${root}${path}`;

	const email = new EmailBuilder()
		.setSubject('Stratos password reset')
		.addTo([ `${u.fullName} <${u.email}>` ])
		.setBody(url);

	const emailer = new Emailer();
	await emailer.sendEmail(email);

	return res.redirect('./login');
});

router.get('/password-reset/:uuid/:token', async (req, res) => {
	const uuid = req.params.uuid;
	const URIToken = req.params.token;
	const token = decodeURIComponent(URIToken);

	let pr;
	try {
		pr = await new PasswordReset(req.db, uuid, token);
	} catch (e) {
		console.error(e);
		return res.redirect('/password-reset');
	}

	const expired = new Date().getTime() > pr.expires * 1000;

	if (expired) {
		console.log('Password reset is invalid');
		return res.redirect('/password-reset');
	}

	return res.render('change-password', {
		...req.hbsContext,
		uuid: uuid,
		token: token
	});
});

router.post('/change-password', async (req, res) => {
	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'password',
				'confPassword',
				'uuid',
				'token'
			],
			{
				password: [ 'password', 'confPassword' ]
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect('/password-reset');
	}

	let pr;
	try {
		pr = await new PasswordReset(
			req.db,
			fields.get('uuid'),
			fields.get('token')
		);
	} catch (e) {
		console.error(e);
		return res.redirect('/password-reset');
	}

	const u = await pr.user;
	await u.changePassword(fields.get('password'));

	return res.redirect('/login');
});

router.post('/contact', (req, res) => {
	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'fname',
				'lname',
				'email',
				'body'
			],
			{
				email: 'email'
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect('/');
	}

	const email = new EmailBuilder()
		.setSubject('Stratos contact request')
		.addTo([
			`${fields.get('fname')} <${fields.get('email')}>`,
			'Stratos <contact@stratos.com>'
		])
		.setBody(fields.get('body'));

	const emailer = new Emailer();
	emailer.sendEmail(email);

	res.send('Thank you for your enquiry, someone will get back to you ' +
		'shortly!');
});

module.exports = {
	root: '/',
	router: router
};
