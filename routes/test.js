'use strict';

const express = require('express');
const router = express.Router();

router.get('/tests', (req, res) => {
	return res.render('tests', {
		title: 'Stratos - Tests',
		current: 'Tests',
		name: req.session.fullName
	});
});

module.exports = {
	root: '/admin',
	router: router
};
