'use strict';

const express = require('express');
const router = express.Router();

router.get('/reports', (req, res, next) => {
	/* eslint-disable multiline-comment-style */
	/*
	return res.render('reports', {
		title: 'Stratos - Reports',
		current: 'Reports',
		name: req.session.fullName
	});
	*/
	/* eslint-enable multiline-comment-style */

	next();
});

module.exports = {
	root: '/admin',
	router: router
};
