const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	return res.redirect('/admin/dashboard');
});

router.get('/dashboard', (req, res) => {
	return res.render('dashboard', {
		title: 'Stratos - Dashboard'
	});
});

router.get('/classes', (req, res) => {
	return res.render('classes', {
		title: 'Stratos - Classes'
	});
});

module.exports = {
	root: '/admin',
	router: router
};
