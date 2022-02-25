'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

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

		const teacherIdSQL = `
			select
				a.accountId as id
			from
				account a
				join accountClassLink acl using (accountId)
			where
				acl.classId = ?;

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

			const ids = await conn.runQuery(teacherIdSQL, [
				classId
			]);

			conn.close();

			this.teacherIds = ids.map(record => record.id);

			const [ teachers, subject ] = await Promise.all([
				this.getTeachers(),
				this.getSubject()
			]);

			this.teachers = teachers;
			this.subject = subject;

			return this;
		})();
	}

	async getSubject() {
		return new (require('./Subject'))(this.subjectId);
	}

	async getTeachers() {
		const teacherPromises = this.teacherIds.map(id => {
			return new (require('./Account'))(id);
		});

		return Promise.all(teacherPromises);
	}

	get tests() {

	}

	get students() {

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

module.exports =  Class;
