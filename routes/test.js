'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const Account = require('../lib/Account');
const User = require('../lib/User');
const Test = require('../lib/Test');

router.get('/tests', async (req, res) => {
	const u = await new User(null, req.session.userId);

	return res.render('tests', {
		title: 'Stratos - Tests',
		current: 'Tests',
		name: req.session.fullName,
		tests: await u.getTests(),
		userType: req.session.userType
	});
});

router.get('/test/add', async (req, res) => {
	const a = await new Account(req.session.userId);

	const promises = [
		a.getTestTemplates(),
		a.getClasses()
	];

	const [ testTemplates, classes ] = await Promise.all(promises);

	res.render('addTest', {
		title: 'Stratos - Add test',
		current: 'Tests',
		name: req.session.fullName,
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
	const tt = await new (require('../lib/TestTemplate'))(testTemplateId);

	const t = await tt.assignClass(
		fields.get('class'),
		fields.get('date').date);

	return res.redirect(`/admin/test/${t.id}`);
});

router.get('/testTemplate/add', (req, res) => {
	res.render('addTestTemplate', {
		title: 'Stratos - Add test template',
		current: 'Tests',
		name: req.session.fullName
	});
});

router.post('/testTemplate/add', async (req, res) => {
	const a = await new Account(req.session.userId);

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
		return res.redirect('/testTemplate/add');
	}

	try {
		await a.createTestTemplate(
			fields.get('name'),
			fields.get('mark'));
	} catch (e) {
		return res.render('error', {
			title: 'Stratos - Error',
			current: 'Tests',
			name: req.session.fullName,
			msg: 'Could not create test template'
		});
	}

	return res.redirect('/admin/test/add');
});

router.get(/test\/(.{36})(\/.*)?/, async (req, res, next) => {
	let t;
	try {
		t = await new Test(req.params[0]);
	} catch (e) {
		return res.status(400).render('error', {
			title: 'Stratos - Error',
			current: 'Tests',
			name: req.session.fullName,
			code: 400,
			msg: e.message
		});
	}

	if (!await t.hasAccess(await new User(null, req.session.userId)))
		return res.redirect('/admin/tests');

	next();
});
router.get('/test/:id', async (req, res) => {
	const t = await new Test(req.params.id);
	const linkRoot = `/admin/test/${t.id}`;

	return res.render('test', {
		title: `Stratos - ${t.template.name}`,
		current: 'Tests',
		name: req.session.fullName,
		testName: t.template.name,
		class: t.class,
		subject: t.class.subject.name,
		maxMark: t.template.maxMark,
		reportsLink: `${linkRoot}/reports`,
		deleteLink: `${linkRoot}/delete`,
		testResults: [ {
			mark: 50,
			percentage: 100,
			grade: 'A',
			author: t.class.teachers[0].shortName,
			time: new Date().toTimeString()
		} ],
		stats: [
			{
				value: 19,
				text: 'Results submitted'
			},
			{
				value: '30%',
				text: 'Average score'
			},
			{
				value: 1,
				text: 'Placeholder'
			},
			{
				value: '2',
				text: 'Placeholder'
			},
			{
				value: '3',
				text: 'Placeholder'
			},
		]
	});
});

module.exports = {
	root: '/admin',
	router: router
};
