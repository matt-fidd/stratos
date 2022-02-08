const express = require('express');
const router = express.Router();

router.get('/tests', (req, res) => {
	return res.render('tests', {
		title: 'Stratos - Tests',
		current: 'Tests'
	});
});

module.exports = {
	root: '/admin',
	router: router
};
