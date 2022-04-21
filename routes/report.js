'use strict';

const express = require('express');
const router = express.Router();

router.get('/reports', (req, res) => {
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
			}
		],
		targets: JSON.stringify({
			student: [
				{
					id: '1',
					name: 'joe'
				}
			],
			class: [
				{
					id: '1',
					name: 'joeseph'
				},
				{
					id: '2',
					name: 'bob'
				},
				{
					id: '3',
					name: 'fred'
				},
				{
					id: '4',
					name: 'mike'
				}
			]
		})
	});
});

router.post('/report/generate', (req, res) => {
	return res.redirect('/admin/reports');
});

module.exports = {
	root: '/admin',
	router: router
};

