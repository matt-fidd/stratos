'use strict';

const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const validator = require('../lib/validator');

const User = require('../lib/User');

router.get('/:id', async (req, res) => {
	const c = req.class;
	const linkRoot = `/admin/class/${c.id}`;
	const upcomingTests = await c.getTests({ range: 'after' });
	const recentTests = await c.getTests({ range: 'before' });
	const testCount = recentTests.length + upcomingTests.length;

	return res.render('class', {
		...req.hbsContext,
		title: `Stratos - ${c.name}`,
		current: 'Classes',
		className: c.name,
		teachers: c.teachers,
		members: c.students,
		recentTests: recentTests,
		upcomingTests: upcomingTests,
		contactLink: `${linkRoot}/contact`,
		testsLink: `${linkRoot}/tests`,
		reportsLink: `${linkRoot}/reports`,
		deleteLink: `${linkRoot}/delete`,
		membersLink: `${linkRoot}/members`,
		teachersLink: `${linkRoot}/teachers`,
		stats: [
			{
				value: testCount,
				text: 'Test' + (testCount !== 1 ? 's' : '')
			},
			{
				value: recentTests.length,
				text: 'Completed test' +
					(recentTests.length !== 1 ? 's' : '')
			},
			{
				value: upcomingTests.length,
				text: 'Upcoming test' +
					(upcomingTests.length !== 1 ? 's' : '')
			},
			{
				value: '72%',
				text: 'Average percentage'
			},
			{
				value: '50%',
				text: 'Last percentage'
			}
		]
	});
});

router.post('/:id/delete', async (req, res) => {
	const c = req.class;
	await c.delete();

	res.redirect('/admin/classes');
});

router.get('/:id/:memberType(members|teachers)', (req, res) => {
	const c = req.class;
	const linkRoot = `/admin/class/${c.id}`;

	let users, addLink, addContent, pageTitle;
	if (req.params.memberType === 'members') {
		users = c.students;
		addLink = `${linkRoot}/members/add`;
		addContent = 'Add new students';
		pageTitle = 'Students';
	} else {
		users = c.teachers;
		addLink = `${linkRoot}/teachers/add`;
		addContent = 'Add new teachers';
		pageTitle = 'Teachers';
	}

	return res.render('classUsers', {
		...req.hbsContext,
		title: `Stratos - ${c.name}`,
		current: 'Classes',
		className: c.name,
		users: users,
		addLink: addLink,
		addContent: addContent,
		pageTitle: pageTitle
	});
});

router.get('/:id/:userType(members|teachers)/add', (req, res) => {
	const c = req.class;
	const userType =
		req.params.userType === 'teachers' ?
			'teachers' :
			'students';

	const errors = [];
	req.query.err && req.query.err.split(',').forEach(e => {
		switch (e) {
			case 'no_user':
				errors.push({
					msg: 'No user with that email ' +
					'address can be found, they need to ' +
					'create an account before you can ' +
					'add them to a class'
				});
				break;
			case 'dup_user':
				errors.push({
					msg: 'This user is already assigned ' +
					'to the class'
				});
				break;
		}
	});

	return res.render('addClassUser', {
		...req.hbsContext,
		title: `Stratos - ${c.name}`,
		current: 'Classes',
		className: c.name,
		postLink: `/admin/class/${c.id}/${req.params.userType}/add`,
		newType: userType.slice(0, -1),
		pageTitle: `Add a new ${userType.slice(0, -1)}`,
		errors: errors
	});
});

router.post('/:id/:userType(members|teachers)/add', async (req, res) => {
	const c = req.class;
	const userType = req.params.userType;
	const rejectURL = `/admin/class/${c.id}/${userType}/add`;

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'email'
			], {
				email: 'email'
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect(rejectURL);
	}

	const u = await User.getUserByEmail(req.db, fields.get('email'));

	if (!u) {
		if (userType === 'teachers')
			return res.redirect(`${rejectURL}/?err=no_user`);

		return res.render('addClassUser2', {
			...req.hbsContext,
			title: `Stratos - ${c.name}`,
			current: 'Classes',
			className: c.name,
			postLink: `/admin/class/${c.id}/members/add2`,
			newType: 'student',
			pageTitle: 'Add a new student',
			email: fields.get('email')
		});
	}

	try {
		await c.addUser(u);
		return res.redirect(`/admin/class/${c.id}/${userType}`);
	} catch (e) {
		return res.redirect(`${rejectURL}/?err=dup_user`);
	}
});

router.post('/:id/members/add2', async (req, res) => {
	const c = req.class;
	const rejectURL = `/admin/class/${c.id}/students/add`;

	let fields;
	try {
		fields = validator.validate(req.body,
			[
				'fname',
				'lname',
				'email'
			], {
				email: 'email'
			}
		).fields;
	} catch (e) {
		console.error(e);
		return res.redirect(rejectURL);
	}

	const password = crypto.randomBytes(20).toString('base64').slice(0, 20);

	const u = await User.createUser(
		req.db,
		'student',
		fields.get('fname'),
		fields.get('onames'),
		fields.get('lname'),
		fields.get('email'),
		password
	);

	await c.addUser(u);

	return res.redirect(`/admin/class/${c.id}/members`);
});

router.get('/:id/:userType(members|teachers)/:userId/remove',
	async (req, res) => {
		const c = req.class;
		const u = await new User(req.db, req.params.userId);

		const userType =
			req.params.userType === 'teachers' ?
				'teachers' :
				'students';

		const postLink =
			`/admin/class/${c.id}/${req.params.userType}` +
			`/${u.id}/remove`;

		return res.render('removeClassUser', {
			...req.hbsContext,
			title: `Stratos - ${c.name}`,
			current: 'Classes',
			u: u,
			postLink: postLink,
			pageTitle: `Remove a ${userType.slice(0, -1)}`
		});
	}
);

router.post('/:id/:userType(members|teachers)/:userId/remove',
	async (req, res) => {
		const c = req.class;
		const u = await new User(req.db, req.params.userId);
		const userType = req.params.userType;

		try {
			await c.removeUser(u);
			return res.redirect(`/admin/class/${c.id}/${userType}`);
		} catch (e) {
			console.error(e);
			return res.render('error', {
				...req.hbsContext,
				title: 'Stratos - Error',
				current: 'Classes',
				msg: `Can not remove this user: ${e.message}`
			});
		}
	}
);

module.exports = {
	priority: 50,
	root: '/admin/class',
	router: router
};
