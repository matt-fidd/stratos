'use strict';

// Import user defined modules
const DatabaseConnectionPool = require('./DatabaseConnectionPool');

/**
 * A class that represents a test template
 */
class TestTemplate {
	/**
	 * The id of the test template
	 * @type {string}
	 */
	id;

	/**
	 * The id of the account that created it
	 * @type {string}
	 */
	accountId;

	/**
	 * The name of the test template
	 * @type {string}
	 */
	name;

	/**
	 * The maximum mark of the test template
	 * @type {number}
	 */
	maxMark;

	/**
	 * @param {string} testTemplateId - The id of the template to fetch
	 */
	constructor(testTemplateId) {
		const sql = `
			select
				testTemplateId as id,
				accountId,
				name,
				maxMark
			from
				testTemplate
			where
				testTemplateId = ?;
		`;

		return (async () => {
			const conn = await new DatabaseConnectionPool();
			const record = await conn.runQuery(sql, [
				testTemplateId,
			]);

			if (!record.length)
				throw new Error('No test template found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			return this;
		})();
	}

	assignClass() {

	}

	get classes() {

	}

	static createTestTemplate() {

	}
}

module.exports = TestTemplate;
