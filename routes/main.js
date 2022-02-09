'use strict';

const express = require('express');
const router = express.Router();

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

module.exports = {
	root: '/',
	router: router
};
