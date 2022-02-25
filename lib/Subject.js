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

			if (!record.length)
				throw new Error('No subject found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			return this;
		})();
	}
}

module.exports = Subject;
