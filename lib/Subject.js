'use strict';

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

	#conn;

	/**
	 * @param {number} subjectID - The id of the subject to fetch
	 */
	constructor(conn, subjectId) {
		this.#conn = conn;

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
			const record = await this.#conn.runQuery(sql, [
				subjectId,
			]);

			if (!record.length)
				throw new Error('No subject found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			return this;
		})();
	}

	static async getAllSubjects(conn) {
		const sql = `
			select
				subjectId as id
			from
				subject;
		`;

		const records = await conn.runQuery(sql);

		const objectPromises = [];

		records.forEach(record => {
			objectPromises.push(new Subject(conn, record.id));
		});

		const objects = await Promise.all(objectPromises);

		return objects;
	}
}

module.exports = Subject;
