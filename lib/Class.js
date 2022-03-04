/* eslint-disable no-empty-function */
'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');
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

	/**
	 * @param {string} classID - The id of the class to fetch
	 */
	constructor(classId) {
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
			const conn = await new DatabaseConnectionPool();

			const record = await conn.runQuery(sql, [
				classId
			]);

			if (!record.length)
				throw new Error('No class found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			const [ teacherRes, studentRes ] = await Promise.all([
				conn.runQuery(teacherSQL, [
					classId
				]),
				conn.runQuery(studentSQL, [
					classId
				])
			]);

			conn.close();

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
		return new (require('./Subject'))(this.subjectId);
	}

	getUsers(ids, type) {
		const types = {
			account: 'Account',
			student: 'Student'
		};

		if (!(type in types))
			throw new Error('Invalid type');

		const promises = ids.map(id => {
			return new (require(`./${types[type]}`))(id);
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

		const conn = await new DatabaseConnectionPool();
		const tests = await conn.runQuery(sql, [ this.id ]);

		const testObjects = tests.map(test => {
			return new Test(test.testId);
		});

		return await Promise.all(testObjects);
	}

	async hasAccess(u) {
		const userClasses = await u.getClasses();

		return userClasses.filter(c => {
			return c.id === this.id;
		}).length;
	}

	addTeacher() {

	}

	removeTeacher() {

	}

	calculateAverageMovement() {

	}

	static createClass() {

	}
}

module.exports = Class;
