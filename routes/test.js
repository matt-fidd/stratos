'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const Account = require('../lib/Account');
const User = require('../lib/User');
const Test = require('../lib/Test');

router.get('/tests', async (req, res) => {
	const u = await new User(req.db, req.session.userId);

	return res.render('tests', {
		...req.hbsContext,
		title: 'Stratos - Tests',
		current: 'Tests',
		tests: await u.getTests()
	});
});

router.get('/test/add', async (req, res) => {
	const a = await new Account(req.db, req.session.userId);

	const promises = [
		a.getTestTemplates(),
		a.getClasses()
	];

	const [ testTemplates, classes ] = await Promise.all(promises);

	res.render('addTest', {
		...req.hbsContext,
		title: 'Stratos - Add test',
		current: 'Tests',
		testTemplates: testTemplates,
		classes: classes
	});
});

router.post('/test/add', async (req, res) => {
	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'testTemplate',
				'class',
				'date'
			], {
				date: 'date'
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect('/test/add');
	}

	const testTemplateId = fields.get('testTemplate');
	const tt = await new (require('../lib/TestTemplate'))(
		req.db,
		testTemplateId
	);

	const t = await tt.assignClass(
		fields.get('class'),
		fields.get('date').date);

	return res.redirect(`/admin/test/${t.id}`);
});

router.all(/test\/(.{36})(\/.*)?/, async (req, res, next) => {
	let t;
	try {
		t = await new Test(req.db, req.params[0]);
	} catch (e) {
		return res.status(400).render('error', {
			...req.hbsContext,
			title: 'Stratos - Error',
			current: 'Tests',
			code: 400,
			msg: e.message
		});
	}

	if (!await t.hasAccess(await new User(
		req.db,
		req.session.userId
	)))
		return res.redirect('/admin/tests');

	req.test = t;
	next();
});


module.exports = {
	priority: 30,
	root: '/admin',
	router: router
};
