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
	const u = await new User(req.db, req.session.userId);

	const recentTests = await u.getTests({ range: 'before' });
	const upcomingTests = await u.getTests({ range: 'after' });
	const classes = await u.getClasses();

	return res.render('dashboard', {
		...req.hbsContext,
		title: 'Stratos - Dashboard',
		current: 'Dashboard',
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

router.all(/user\/(.{36})(\/.*)?/, async (req, res, next) => {
	let u;
	try {
		u = await new User(req.db, req.params[0]);
	} catch (e) {
		return res.status(400).render('error', {
			...req.hbsContext,
			title: 'Stratos - Error',
			current: 'Dashboard',
			code: 400,
			msg: e.message
		});
	}

	if (!await u.hasAccess(await new User(
		req.db,
		req.session.userId
	)))
		return res.redirect('/admin/dashboard');

	req.user = u;
	next();
});

router.get('/user/:id', (req, res) => {
	const u = req.user;

	return res.render('user', {
		...req.hbsContext,
		title: `Stratos - ${u.shortName}`,
		current: 'Dashboard',
		user: u
	});
});

module.exports = {
	root: '/admin',
	router: router
};
