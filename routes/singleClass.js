'use strict';

const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const Class = require('../lib/Class');
const User = require('../lib/User');

router.get('/:id', async (req, res) => {
	const c = await new Class(req.db, req.params.id);
	const linkRoot = `/admin/class/${c.id}`;
	const upcomingTests = await c.getTests({ range: 'after' });
	const recentTests = await c.getTests({ range: 'before' });
	const testCount = recentTests.length + upcomingTests.length;

	return res.render('class', {
		title: `Stratos - ${c.name}`,
		current: 'Classes',
		name: req.session.fullName,
		className: c.name,
		teachers: c.teachers,
		members: c.students,
		recentTests: recentTests,
		upcomingTests: upcomingTests,
		contactLink: `${linkRoot}/contact`,
		testsLink: `${linkRoot}/tests`,
		reportsLink: `${linkRoot}/reports`,
		deleteLink: `${linkRoot}/delete`,
		membersLink: `${linkRoot}/members`,
		teachersLink: `${linkRoot}/teachers`,
		userType: req.session.userType,
		stats: [
			{
				value: testCount,
				text: 'Test' + (testCount !== 1 ? 's' : '')
			},
			{
				value: recentTests.length,
				text: 'Completed test' +
					(recentTests.length !== 1 ? 's' : '')
			},
			{
				value: upcomingTests.length,
				text: 'Upcoming test' +
					(upcomingTests.length !== 1 ? 's' : '')
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

router.get('/:id/:memberType(members|teachers)', async (req, res) => {
	const c = await new Class(req.db, req.params.id);
	const linkRoot = `/admin/class/${c.id}`;

	let users, addLink, addContent, pageTitle;
	if (req.params.memberType === 'members') {
		users = c.students;
		addLink = `${linkRoot}/members/add`;
		addContent = 'Add new students';
		pageTitle = 'Students';
	} else {
		users = c.teachers;
		addLink = `${linkRoot}/teachers/add`;
		addContent = 'Add new teachers';
		pageTitle = 'Teachers';
	}

	return res.render('classUsers', {
		title: `Stratos - ${c.name}`,
		current: 'Classes',
		name: req.session.fullName,
		userType: req.session.userType,
		className: c.name,
		users: users,
		addLink: addLink,
		addContent: addContent,
		pageTitle: pageTitle
	});
});

module.exports = {
	root: '/admin/class',
	router: router
};
