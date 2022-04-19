'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const Account = require('../lib/Account');
const Class = require('../lib/Class');
const User = require('../lib/User');
const Subject = require('../lib/Subject');

router.get('/classes', async (req, res) => {
	const u = await new User(req.db, req.session.userId);

	return res.render('classes', {
		...req.hbsContext,
		title: 'Stratos - Classes',
		current: 'Classes',
		classes: await u.getClasses()
	});
});

router.get('/class/add', async (req, res) => {
	const subjects = await Subject.getAllSubjects(req.db);

	res.render('addClass', {
		...req.hbsContext,
		title: 'Stratos - Add class',
		current: 'Classes',
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
			...req.hbsContext,
			title: 'Stratos - Error',
			current: 'Classes',
			code: 400,
			msg: e.message
		});
	}

	if (!await c.hasAccess(await new User(
		req.db,
		req.session.userId
	)))
		return res.redirect('/admin/classes');

	req.class = c;
	next();
});

module.exports = {
	priority: 30,
	root: '/admin',
	router: router
};
