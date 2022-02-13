'use strict';

const express = require('express');
const router = express.Router();

router.get('/classes', (req, res) => {
	return res.render('classes', {
		title: 'Stratos - Classes',
		current: 'Classes',
		name: req.session.fullName
	});
});

module.exports = {
	root: '/admin',
	router: router
};
