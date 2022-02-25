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

		return (async () => {
			const conn = await new DatabaseConnectionPool();
			const record = await conn.runQuery(sql, [
				classId,
			]);

			if (!record.length)
				throw new Error('No class found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			this.subject = await this.getSubject();

			return this;
		})();
	}

	async getSubject() {
		return new (require('./Subject'))(this.subjectId);
	}


	}

	get tests() {

	}

	get teachers() {

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
