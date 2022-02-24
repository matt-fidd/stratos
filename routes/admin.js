'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	return res.redirect('/admin/dashboard');
});

router.get('/dashboard', (req, res) => {
	return res.render('dashboard', {
		title: 'Stratos - Dashboard',
		current: 'Dashboard',
		name: req.session.fullName,
		stats: [
			{
				value: 5,
				text: 'Classes'
			},
			{
				value: 11,
				text: 'Completed Tests'
			},
			{
				value: 1,
				text: 'Upcoming Test'
			},
			{
				value: '90%',
				text: 'Pass rate'
			}
		],
		recentTests: [
			{
				id: 1,
				date: '08/01/2022',
				name: 'Lagged homework 8'
			},
			{
				id: 1,
				date: '08/01/2022',
				name: 'Lagged homework 8'
			},
			{
				id: 1,
				date: '08/01/2022',
				name: 'Lagged homework 8'
			}
		],
		upcomingTests: [
			{
				id: 1,
				date: '08/01/2022',
				name: 'Lagged homework 8'
			},
			{
				id: 1,
				date: '08/01/2022',
				name: 'Lagged homework 8'
			},
			{
				id: 1,
				date: '08/01/2022',
				name: 'Lagged homework 8'
			}
		]
	});
});

module.exports = {
	root: '/admin',
	router: router
};
