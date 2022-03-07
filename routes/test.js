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

router.post('/test/add', (req, res) => {
	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'testTemplate',
				'class',
				'date'
			]
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect('/test/add');
	}

	console.log(fields);
});

router.get('/testTemplate/add', (req, res) => {
	res.render('addTestTemplate', {
		title: 'Stratos - Add test template',
		current: 'Tests',
		name: req.session.fullName
	});
});

router.post('/testTemplate/add', (req, res) => {
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

	console.log(fields);
});

router.get('/test/:id', async (req, res) => {
	let t;
	try {
		t = await new Test(req.params.id);
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

	const linkRoot = `/test/${t.id}`;

	return res.render('test', {
		title: `Stratos - ${t.template.name}`,
		current: 'Tests',
		name: req.session.fullName,
		testName: t.template.name,
		class: t.class,
		subject: t.class.subject.name,
		maxMark: t.template.maxMark,
		reportsLink: `${linkRoot}/reports`,
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
