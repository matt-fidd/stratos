'use strict';

const express = require('express');
const router = express.Router();
const { stringify } = require('csv-stringify');

const Class = require('../lib/Class');
const Student = require('../lib/Student');
const Test = require('../lib/Test');
const User = require('../lib/User');

const validator = require('../lib/validator');

router.all(/\/reports.*/, (req, res, next) => {
	if (!req.session.userType === 'account')
		return res.redirect('/admin');

	next();
});

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

router.post('/report/generate', async (req, res) => {
	const u = await new User(req.db, req.session.userId);

	const classes = await u.getClasses();
	const tests = await u.getTests();
	const studentIds = [];
	classes.forEach(c => studentIds.push(...c.studentIds));

	const extractIds = (obj) => obj.id;

	const ids = [
		...classes.map(extractIds),
		...tests.map(extractIds),
		...studentIds
	];

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'type',
				'target'
			],
			{
				values: {
					type: [ 'student', 'class', 'test' ],
					target: ids
				}
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.status(400).json({ status: 'Invalid' });
	}

	let data;
	let filename;

	switch (fields.get('type')) {
		case 'student': {
			const s = await new Student(
				req.db,
				fields.get('target'));
			const trs = await s.getTestResults();

			data = trs.map(tr =>
				({
					'Test Name': tr.test.template.name,
					'Class': tr.test.class.name,
					'Test Date': tr.test
						.getDateString(false),
					'Max Mark': tr.test.template.maxMark,
					'Mark': tr.mark,
					'Percentage': `${tr.percentage}%`,
					'Grade': tr.grade
				})
			);

			filename = s.shortName;

			break;
		}
		case 'class': {
			const c = await new Class(req.db, fields.get('target'));
			const ts = await c.getTests({ range: 'before' });

			data = await Promise.all(ts.map(async t => {
				const [
					trs,
					avgPer,
					avgScore
				] = await Promise.all([
					t.getTestResults(),
					t.getAveragePercentage(),
					t.getAverageScore()
				]);

				return {
					'Test Name': t.template.name,
					'Test Date': t.getDateString(false),
					'Max Mark': t.template.maxMark,
					'Results Submitted': `${trs.length}/` +
						t.class.studentIds.length +
						'\t',
					'Average score': avgScore,
					'Average percentage': `${avgPer}%`
				};
			}));

			filename = c.name;

			break;
		}
		case 'test': {
			const t = await new Test(req.db, fields.get('target'));
			const trs = await t.getTestResults();

			data = trs.map(tr =>
				({
					'Student': tr.student.fullName,
					'Test Date': tr.test
						.getDateString(false),
					'Max Mark': tr.test.template.maxMark,
					'Mark': tr.mark,
					'Percentage': `${tr.percentage}%`,
					'Grade': tr.grade
				})
			);

			filename = `${t.class.name}-${t.template.name}`;

			break;
		}
	}

	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition',
		`attachment; filename="stratos-report-${filename}.csv"`);
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Pragma', 'no-cache');

	stringify(data, { header: true })
		.pipe(res);
});

module.exports = {
	root: '/admin',
	router: router
};

