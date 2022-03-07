'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

class Subject {
	/**
	 * The id of the subject
	 * @type {number}
	 */
	id;

	/**
	 * The name of the subject
	 * @type {string}
	 */
	name;

	/**
	 * @param {number} subjectID - The id of the subject to fetch
	 */
	constructor(subjectId) {
		const sql = `
			select
				subjectId as id,
				name
			from
				subject
			where
				subjectId = ?;
		`;

		return (async () => {
			const conn = await new DatabaseConnectionPool();
			const record = await conn.runQuery(sql, [
				subjectId,
			]);

			conn.close();

			if (!record.length)
				throw new Error('No subject found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			return this;
		})();
	}

	static async getAllSubjects() {
		const sql = `
			select
				subjectId as id
			from
				subject;
		`;

		const conn = await new DatabaseConnectionPool();
		const records = await conn.runQuery(sql);
		conn.close();

		const objectPromises = [];

		records.forEach(record => {
			objectPromises.push(new Subject(record.id));
		});

		const objects = await Promise.all(objectPromises);

		return objects;
	}
}

module.exports = Subject;
