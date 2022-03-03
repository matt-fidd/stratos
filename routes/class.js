'use strict';

const express = require('express');
const router = express.Router();

const Class = require('../lib/Class');
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

router.get('/class/:id', async (req, res) => {
	const c = await new Class(req.params.id);
	const linkRoot = `/class/${c.id}`;

	return res.render('class', {
		title: `Stratos - Class - ${c.name}`,
		current: 'Classes',
		name: req.session.fullName,
		className: c.name,
		teachers: c.teachers,
		members: c.students,
		recentTests: await c.getTests({ range: 'before' }),
		upcomingTests: await c.getTests({ range: 'after' }),
		contactLink: `${linkRoot}/contact`,
		testsLink: `${linkRoot}/tests`,
		reportsLink: `${linkRoot}/reports`,
		stats: [
			{
				value: 5,
				text: 'Tests'
			},
			{
				value: 3,
				text: 'Tests completed'
			},
			{
				value: 2,
				text: 'Tests upcoming'
			},
			{
				value: '72%',
				text: 'Average percentage'
			},
			{
				value: '50%',
				text: 'Last percentage'
			},
		]
	});
});

module.exports = {
	root: '/admin',
	router: router
};
