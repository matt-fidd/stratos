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

module.exports = {
	root: '/',
	router: router
};
