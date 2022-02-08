const express = require('express');
const router = express.Router();

router.get('/classes', (req, res) => {
	return res.render('classes', {
		title: 'Stratos - Classes',
		current: 'Classes'
	});
});

module.exports = {
	root: '/admin',
	router: router
};
