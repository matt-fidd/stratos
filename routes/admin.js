'use strict';

// Import required modules
const express = require('express');
const router = express.Router();

// Import user defined modules
const User = require('../lib/User');

// Redirect /admin to /admin/dashboard
router.get('/', (req, res) => {
	return res.redirect('/admin/dashboard');
});

router.get('/dashboard', async (req, res) => {
	const u = await new User(null, req.session.userId);

	const recentTests = await u.getTests({ range: 'before' });
	const upcomingTests = await u.getTests({ range: 'after' });
	const classes = await u.getClasses();

	return res.render('dashboard', {
		title: 'Stratos - Dashboard',
		current: 'Dashboard',
		name: req.session.fullName,
		stats: [
			{
				value: classes.length,
				text: 'Class' +
					(classes.length !== 1 ? 'es' : '')
			},
			{
				value: recentTests.length,
				text: 'Completed Test' +
					(recentTests.length !== 1 ? 's' : '')
			},
			{
				value: upcomingTests.length,
				text: 'Upcoming Test' +
					(upcomingTests.length !== 1 ? 's' : '')
			},
			{
				value: '90%',
				text: 'Pass rate'
			}
		],
		recentTests: recentTests,
		upcomingTests: upcomingTests
	});
});

module.exports = {
	root: '/admin',
	router: router
};
