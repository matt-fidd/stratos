'use strict';

const express = require('express');
const router = express.Router();

router.get('/reports', (req, res, next) => {
	/* eslint-disable multiline-comment-style */
	/*
	return res.render('reports', {
		...req.hbsContext,
		title: 'Stratos - Reports',
		current: 'Reports'
	});
	*/
	/* eslint-enable multiline-comment-style */

	next();
});

module.exports = {
	root: '/admin',
	router: router
};
