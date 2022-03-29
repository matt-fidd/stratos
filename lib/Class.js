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

		const teacherSQL = `
			select
				a.accountId as id
			from
				account a
				join accountClassLink acl using (accountId)
			where
				acl.classId = ?;

		`;

		const studentSQL = `
			select
				s.studentId as id
			from
				student s
				join studentClassLink scl using (studentId)
			where
				scl.classId = ?;

		`;

		return (async () => {
			const record = await this.#conn.runQuery(sql, [
				classId
			]);

			if (!record.length)
				throw new Error('No class found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			const [ teacherRes, studentRes ] = await Promise.all([
				this.#conn.runQuery(teacherSQL, [
					classId
				]),
				this.#conn.runQuery(studentSQL, [
					classId
				])
			]);

			this.teacherIds = teacherRes.map(record => record.id);
			this.studentIds = studentRes.map(record => record.id);

			const [
				teachers,
				students,
				subject,
			] = await Promise.all([
				this.getUsers(this.teacherIds, 'account'),
				this.getUsers(this.studentIds, 'student'),
				this.getSubject()
			]);

			this.teachers = teachers;
			this.students = students;
			this.subject = subject;

			return this;
		})();
	}

	getSubject() {
		return new (require('./Subject'))(this.#conn, this.subjectId);
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

	removeUser(u) {
		switch (u.type) {
			case 'account':
				break;
			case 'student':
				break;
			default:
				throw new Error('Invalid user type');
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
