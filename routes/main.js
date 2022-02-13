'use strict';

const express = require('express');
const router = express.Router();

const Account = require('../lib/Account');
const validator = require('../lib/validator');

router.get('/', (req, res) => {
	return res.render('index', {
		title: 'Stratos - Home'
	});
});

router.get('/login', (req, res) => {
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
	return res.render('logout', {
		title: 'Stratos - Logout',
		username: req.session.fullName
	});
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

module.exports = {
	root: '/',
	router: router
};
