'use strict';

const express = require('express');
const router = express.Router();

router.get('/reports', (req, res, next) => {
/*
	return res.render('reports', {
		title: 'Stratos - Reports',
		current: 'Reports',
		name: req.session.fullName
	});
*/

	next();
});

module.exports = {
	root: '/admin',
	router: router
};
