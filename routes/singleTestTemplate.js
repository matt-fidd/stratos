'use strict';

const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

router.get('/:id', async (req, res) => {
	const tt = req.tt;
	const linkRoot = `/admin/test-template/${tt.id}`;

	return res.render('testTemplate', {
		...req.hbsContext,
		title: `Stratos - ${tt.name}`,
		current: 'Test Templates',
		name: tt.name,
		id: tt.id,
		maxMark: tt.maxMark,
		editLink: `${linkRoot}/edit`,
		deleteLink: `${linkRoot}/delete`,
		basedTests: await tt.getTests()
	});
});

router.post('/:id/edit', async (req, res) => {
	const tt = req.tt;
	const returnURL = `/admin/test-template/${tt.id}`;

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'maxMark',
				'name'
			]
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect(returnURL);
	}

	await Promise.all([
		tt.setMaxMark(fields.get('maxMark')),
		tt.setName(fields.get('name'))
	]);

	res.redirect(returnURL);
});

router.post('/:id/delete', async (req, res) => {
	const tt = req.tt;
	await tt.delete();

	res.redirect('/admin/test-templates');
});

module.exports = {
	priority: 50,
	root: '/admin/test-template',
	router: router
};
