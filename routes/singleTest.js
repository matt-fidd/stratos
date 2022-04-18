'use strict';

const express = require('express');
const router = express.Router();

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
		title: `Stratos - ${t.template.name}`,
		current: 'Tests',
		name: req.session.fullName,
		testName: t.template.name,
		class: t.class,
		subject: t.class.subject.name,
		maxMark: t.template.maxMark,
		reportsLink: `${linkRoot}/reports`,
		deleteLink: `${linkRoot}/delete`,
		userType: req.session.userType,
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

module.exports = {
	priority: 50,
	root: '/admin/test',
	router: router
};
