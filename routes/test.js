'use strict';

const express = require('express');
const router = express.Router();

const User = require('../lib/User');

router.get('/tests', async (req, res) => {
	const u = await new User(null, req.session.userId);

	return res.render('tests', {
		title: 'Stratos - Tests',
		current: 'Tests',
		name: req.session.fullName,
		tests: await u.getTests()
	});
});

module.exports = {
	root: '/admin',
	router: router
};
