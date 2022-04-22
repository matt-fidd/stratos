'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const TestResult = require('../lib/TestResult');

router.get('/:id', async (req, res) => {
	const t = req.test;
	const linkRoot = `/admin/test/${t.id}`;

	let results = await t.getTestResults();
	const resultCount = results.length;

	const averageScore = await t.getAverageScore();
	const averagePercentage = await t.getAveragePercentage();

	const stats = [
		{
			value: `${resultCount}/${t.class.studentIds.length}`,
			text: 'Results submitted'
		},
		{
			value: `${averageScore}/${t.template.maxMark}`,
			text: 'Average score'
		},
		{
			value: `${averagePercentage}%`,
			text: 'Average percentage'
		}
	];

	if (req.session.userType === 'student') {
		results = results.filter(r =>
			r.student.id === req.session.userId
		);

		if (results.length) {
			stats.push({
				value: results[0].mark - averageScore,
				text: '+- Average score'
			});

			stats.push({
				value: `${results[0].percentage -
					averagePercentage}%`,
				text: '+- Average percentage'
			});
		}
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
		stats: stats
	});
});

router.post('/:id/delete', async (req, res) => {
	if (req.session.userType !== 'account')
		return res.redirect('/admin/tests');

	const t = req.test;
	await t.delete();

	res.redirect('/admin/tests');
});


router.get('/:id/results', async (req, res) => {
	if (req.session.userType !== 'account')
		return res.redirect('/admin/tests');

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
	if (req.session.userType !== 'account')
		return res.redirect('/admin/tests');

	const t = req.test;
	const tr = await new TestResult(req.db, req.params.resultId);

	const returnURL = `/admin/test/${t.id}/results`;

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'mark'
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
	if (req.session.userType !== 'account')
		return res.redirect('/admin/tests');

	const t = req.test;
	const tr = await new TestResult(req.db, req.params.resultId);
	const returnURL = `/admin/test/${t.id}/results`;

	await tr.delete();

	res.redirect(returnURL);
});

router.get('/:id/results/add', async (req, res) => {
	if (req.session.userType !== 'account')
		return res.redirect('/admin/tests');

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
	if (req.session.userType !== 'account')
		return res.redirect('/admin/tests');

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
