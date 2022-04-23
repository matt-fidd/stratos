/* eslint-disable no-empty-function */
'use strict';

const crypto = require('crypto');

const Subject = require('./Subject');
const Test = require('./Test');

class Class {
	/**
	 * The id of the class
	 * @type {string}
	 */
	id;

	/**
	 * The id of the subject the class is for
	 * @type {string}
	 */
	subjectId;

	/**
	 * The subject the class is for
	 * @type {Subject}
	 */
	subject;

	/**
	 * The name of the class
	 * @type {string}
	 */
	name;

	/**
	 * The ids of the teachers assigned to the class
	 * @type {Array<string>}
	 */
	teacherIds;

	/**
	 * The teachers assigned to the class
	 * @type {Array<Account>}
	 */
	teachers;

	/**
	 * The ids of the students assigned to the class
	 * @type {Array<string>}
	 */
	studentIds;

	/**
	 * The students assigned to the class
	 * @type {Array<Account>}
	 */
	students;

	#conn;

	/**
	 * @param {string} classID - The id of the class to fetch
	 */
	constructor(conn, classId) {
		this.#conn = conn;

		const sql = `
			select
				classId as id,
				name,
				subjectId
			from
				class
			where
				classId = ?;
		`;

		return (async () => {
			const record = await this.#conn.runQuery(sql, [
				classId
			]);

			if (!record.length)
				throw new Error('No class found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			const [
				teachers,
				students,
				subject
			] = await Promise.all([
				this.getTeachers(),
				this.getStudents(),
				this.getSubject()
			]);

			this.teachers = teachers.objs;
			this.teacherIds = teachers.ids;

			this.students = students.objs;
			this.studentIds = students.ids;

			this.subject = subject;

			return this;
		})();
	}

	getSubject() {
		return new (require('./Subject'))(this.#conn, this.subjectId);
	}

	async getTeachers(fetchObjects = true) {
		const sql = `
			select
				a.accountId as id
			from
				account a
				join accountClassLink acl using (accountId)
			where
				acl.classId = ?;

		`;

		const res = await this.#conn.runQuery(sql, [ this.id ]);

		const ids = res.map(record => record.id);

		if (!fetchObjects)
			return { ids: ids };

		const teachers = await this.getUsers(
			ids,
			'account');

		return { ids: ids, objs: teachers };
	}

	async getStudents(fetchObjects = true) {
		const sql = `
			select
				s.studentId as id
			from
				student s
				join studentClassLink scl using (studentId)
			where
				scl.classId = ?;
		`;

		const res = await this.#conn.runQuery(sql, [ this.id ]);

		const ids = res.map(record => record.id);

		if (!fetchObjects)
			return { ids: ids };

		const students = await this.getUsers(
			ids,
			'student');

		return { ids: ids, objs: students };
	}

	async getParents() {
		const parentInters = await Promise.all(this.students.map(s =>
			s.getParents()));

		const parents = [];

		parentInters.forEach(pi => parents.push(...pi));

		return parents;
	}

	getUsers(ids, type) {
		const types = {
			account: 'Account',
			student: 'Student'
		};

		if (!(type in types))
			throw new Error('Invalid type');

		const promises = ids.map(id => {
			const classFile = `./${types[type]}`;
			return new (require(classFile))(this.#conn, id);
		});

		return Promise.all(promises);
	}

	async getTests({ order='desc', range='all' } = {}) {
		const validOrder = [ 'asc', 'desc' ];
		const validRange = [ 'all', 'before', 'after' ];

		if (!validOrder.includes(order))
			throw new Error('Invalid order');

		if (!validRange.includes(range))
			throw new Error('Invalid range');

		let sql = `
			select
				t.testId as testId
			from
				class c
				join test t using(classId)
			where
				c.classId = ?
		`;

		switch (range) {
			case 'before':
				sql += 'and t.testDate <= curdate()';
				break;
			case 'after':
				sql += 'and t.testDate > curdate()';
				break;
		}

		sql += `order by t.testDate  ${order};`;

		const tests = await this.#conn.runQuery(sql, [ this.id ]);

		const testObjects = tests.map(test => {
			return new Test(this.#conn, test.testId);
		});

		return await Promise.all(testObjects);
	}

	async hasAccess(u) {
		const userClasses = await u.getClasses();

		return userClasses.filter(c => {
			return c.id === this.id;
		}).length;
	}

	async addUser(u) {
		const validTypes = [ 'account', 'student' ];

		if (!validTypes.includes(u.type))
			throw new Error('Invalid user type');

		const sql = `
			insert into ${u.type}ClassLink(
				${u.type}Id,
				classId)
			values
				(?, ?);
		`;

		try {
			await this.#conn.runQuery(sql, [
				u.id,
				this.id
			]);
		} catch (e) {
			console.error(e);
			throw new Error('Could not add user to class');
		}
	}

	async removeUser(u) {
		const validTypes = [ 'account', 'student' ];

		if (!validTypes.includes(u.type))
			throw new Error('Invalid user type');

		const teachers = (await this.getTeachers(false)).ids;

		if (u.type === 'account' && teachers.length < 2)
			throw new Error('Can\'t remove last teacher');

		const sql = `
			delete from ${u.type}ClassLink
			where
				${u.type}id = ?
				and classId = ?;
		`;

		try {
			await this.#conn.runQuery(sql, [
				u.id,
				this.id
			]);
		} catch (e) {
			console.error(e);
			throw new Error('Could not remove user from class');
		}
	}

	async delete() {
		const sql = `
			delete from
				class
			where
				classId = ?;
		`;

		try {
			await this.#conn.runQuery(sql, [ this.id ]);
		} catch (e) {
			console.error(e);
		}
	}

	calculateAverageMovement() {

	}

	static async createClass(conn, accountId, name, subjectId) {
		const s = await new Subject(conn, subjectId);
		const a = await new (require('./Account'))(conn, accountId);

		const id = crypto.randomUUID();

		let sql = `
			insert into class(
				classId,
				name,
				subjectId)
			values
				(?, ?, ?);
		`;

		await conn.runQuery(sql, [
			id,
			name,
			s.id
		]);

		sql = `
			insert into accountClassLink(
				accountId,
				classId)
			values
				(?, ?);
		`;

		await conn.runQuery(sql, [
			a.id,
			id
		]);

		return new Class(conn, id);
	}
}

module.exports = Class;
