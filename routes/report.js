'use strict';

const express = require('express');
const router = express.Router();

const User = require('../lib/User');

const validator = require('../lib/validator');

router.get('/reports', async (req, res) => {
	const u = await new User(req.db, req.session.userId);
	const classes = await u.getClasses();
	const tests = await u.getTests();

	let studentIds = [];
	let students = [];
	classes.forEach(c => studentIds.push(...c.studentIds));
	classes.forEach(c => students.push(...c.students));

	studentIds = studentIds.map((s, i) =>
		studentIds.indexOf(s) === i ? s : '');
	students = students.filter((_, i) => studentIds[i] !== '');

	return res.render('reports', {
		...req.hbsContext,
		title: 'Stratos - Reports',
		current: 'Reports',
		types: [
			{
				key: 'student',
				value: 'Student'
			},
			{
				key: 'class',
				value: 'Class'
			},
			{
				key: 'test',
				value: 'Test'
			}
		],
		targets: JSON.stringify({
			student: students.map(s => ({
				id: s.id, name: s.shortName
			})),
			class: classes.map(c => ({ id: c.id, name: c.name })),
			test: tests.map(t => ({
				id: t.id,
				name: `${t.template.name} - ` +
					`${t.class.name} - ` +
					`${t.getDateString()}`
			}))
		})
	});
});

router.post('/report/generate', (req, res) => {
	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'type',
				'target'
			],
			{
				values: {
					type: [],
					target: []
				}
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.status(400).json({ status: 'Invalid' });
	}

	fields.get('type');

	return res.redirect('/admin/reports');
});

module.exports = {
	root: '/admin',
	router: router
};

