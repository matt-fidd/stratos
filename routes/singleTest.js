'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const TestResult = require('../lib/TestResult');

router.get('/:id', async (req, res) => {
	const t = req.test;
	const linkRoot = `/admin/test/${t.id}`;

	let results = await t.getTestResults();

	if (req.session.userType === 'student') {
		results = results.filter(r =>
			r.student.id === req.session.userId
		);
	}

	return res.render('test', {
		...req.hbsContext,
		title: `Stratos - ${t.template.name}`,
		current: 'Tests',
		testName: t.template.name,
		class: t.class,
		subject: t.class.subject.name,
		maxMark: t.template.maxMark,
		reportsLink: `${linkRoot}/reports`,
		resultsLink: `${linkRoot}/results`,
		deleteLink: `${linkRoot}/delete`,
		testResults: results,
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

router.get('/:id/results', async (req, res) => {
	const t = req.test;
	const linkRoot = `/admin/test/${t.id}/results`;

	if (!req.session.userType === 'account')
		return res.redirect(linkRoot);

	const results = await t.getTestResults();

	return res.render('testResults', {
		...req.hbsContext,
		title: `Stratos - ${t.template.name}`,
		current: 'Tests',
		testName: t.template.name,
		testResults: results,
		linkRoot: linkRoot,
		addLink: `${linkRoot}/add`
	});
});

router.post('/:id/results/:resultId/edit', async (req, res) => {
	const t = req.test;
	const tr = await new TestResult(req.db, req.params.resultId);

	const returnURL = `/admin/test/${t.id}/results`;

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'mark',
			]
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect(returnURL);
	}

	await tr.setMark(fields.get('mark'));

	res.redirect(returnURL);
});

router.post('/:id/results/:resultId/delete', async (req, res) => {
	const t = req.test;
	const tr = await new TestResult(req.db, req.params.resultId);
	const returnURL = `/admin/test/${t.id}/results`;

	await tr.delete();

	res.redirect(returnURL);
});

router.get('/:id/results/add', async (req, res) => {
	const t = req.test;
	const linkRoot = `/admin/test/${t.id}/results`;

	const existingResults = (await t.getTestResults())
		.map(r => r.student.id);

	const students = t.class.students
		.filter(s => !existingResults.includes(s.id));

	return res.render('addTestResult', {
		...req.hbsContext,
		title: `Stratos - ${t.template.name}`,
		current: 'Tests',
		testName: t.template.name,
		linkRoot: linkRoot,
		students: students,
		maxMark: t.template.maxMark
	});
});

router.post('/:id/results/add', async (req, res) => {
	const t = req.test;
	const returnURL = `/admin/test/${t.id}/results`;

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'student',
				'mark'
			]
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect(returnURL);
	}

	await t.addResult(
		req.session.userId,
		fields.get('student'),
		fields.get('mark')
	);

	return res.redirect(returnURL);
});

module.exports = {
	priority: 50,
	root: '/admin/test',
	router: router
};
