'use strict';

const express = require('express');
const router = express.Router();

const User = require('../lib/User');

router.get('/classes', async (req, res) => {
	const u = await new User(null, req.session.userId);

	return res.render('classes', {
		title: 'Stratos - Classes',
		current: 'Classes',
		name: req.session.fullName,
		classes: await u.getClasses()
	});
});

module.exports = {
	root: '/admin',
	router: router
};
