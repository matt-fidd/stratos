'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const Account = require('../lib/Account');
const Class = require('../lib/Class');
const User = require('../lib/User');
const Subject = require('../lib/Subject');

router.get('/classes', async (req, res) => {
	const u = await new User(req.db, null, req.session.userId);

	return res.render('classes', {
		title: 'Stratos - Classes',
		current: 'Classes',
		name: req.session.fullName,
		classes: await u.getClasses(),
		userType: req.session.userType
	});
});

router.get('/class/add', async (req, res) => {
	const subjects = await Subject.getAllSubjects(req.db);

	res.render('addClass', {
		title: 'Stratos - Add class',
		current: 'Classes',
		name: req.session.fullName,
		subjects: subjects
	});
});

router.post('/class/add', async (req, res) => {
	const a = await new Account(req.db, req.session.userId);

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'name',
				'subject'
			]
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect('/class/add');
	}

	const c = await a.createClass(
		fields.get('name'),
		fields.get('subject'));

	res.redirect(`/admin/class/${c.id}/members`);
});

router.all(/class\/(.{36})(\/.*)?/, async (req, res, next) => {
	let c;
	try {
		c = await new Class(req.db, req.params[0]);
	} catch (e) {
		return res.status(400).render('error', {
			title: 'Stratos - Error',
			current: 'Classes',
			name: req.session.fullName,
			code: 400,
			msg: e.message
		});
	}

	if (!await c.hasAccess(await new User(req.db,
		null,
		req.session.userId
	)))
		return res.redirect('/admin/classes');

	next();
});

router.get('/class/:id', async (req, res) => {
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

router.get('/class/:id/teachers', async (req, res) => {
	const c = await new Class(req.db, req.params.id);

	return res.render('classUsers', {
		title: `Stratos - ${c.name}`,
		current: 'Classes',
		name: req.session.fullName,
		userType: req.session.userType,
		className: c.name,
		users: c.teachers,
		addLink: `/admin/class/${c.id}/teachers/add`,
		addContent: 'Add new teachers',
		pageTitle: 'Teachers'
	});
});

router.get('/class/:id/members', async (req, res) => {
	const c = await new Class(req.db, req.params.id);

	return res.render('classUsers', {
		title: `Stratos - ${c.name}`,
		current: 'Classes',
		name: req.session.fullName,
		userType: req.session.userType,
		className: c.name,
		users: c.students,
		addLink: `/admin/class/${c.id}/members/add`,
		addContent: 'Add new students',
		pageTitle: 'Students'
	});
});

module.exports = {
	root: '/admin',
	router: router
};
