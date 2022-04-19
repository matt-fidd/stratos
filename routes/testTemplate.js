'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const Account = require('../lib/Account');
const User = require('../lib/User');
const TestTemplate = require('../lib/TestTemplate');

router.get('/test-templates', async (req, res) => {
	const u = await new User(req.db, req.session.userId);

	return res.render('testTemplates', {
		...req.hbsContext,
		title: 'Stratos - Test Templates',
		current: 'Test Templates',
		templates: await u.getTestTemplates()
	});
});

router.get('/test-template/add', (req, res) => {
	res.render('addTestTemplate', {
		...req.hbsContext,
		title: 'Stratos - Add test template',
		current: 'Test Templates'
	});
});

router.post('/test-template/add', async (req, res) => {
	const a = await new Account(req.db, req.session.userId);

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'name',
				'mark'
			]
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect('/test-template/add');
	}

	try {
		await a.createTestTemplate(
			fields.get('name'),
			fields.get('mark')
		);
	} catch (e) {
		console.error(e);

		return res.render('error', {
			...req.hbsContext,
			title: 'Stratos - Error',
			current: 'Test Templates',
			msg: 'Could not create test template'
		});
	}

	return res.redirect('/admin/test-templates');
});

router.all(/test-template\/(.{36})(\/.*)?/, async (req, res, next) => {
	let tt;
	try {
		tt = await new TestTemplate(req.db, req.params[0]);
	} catch (e) {
		return res.status(400).render('error', {
			...req.hbsContext,
			title: 'Stratos - Error',
			current: 'Test Templates',
			code: 400,
			msg: e.message
		});
	}

	if (!await tt.hasAccess(await new User(
		req.db,
		req.session.userId
	)))
		return res.redirect('/admin/test-templates');

	req.tt = tt;
	next();
});

module.exports = {
	priority: 30,
	root: '/admin',
	router: router
};
