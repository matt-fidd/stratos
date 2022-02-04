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


module.exports = {
	root: '/admin',
	router: router
};
