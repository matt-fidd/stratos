/* eslint-disable no-empty-function, getter-return */
'use strict';

const crypto = require('crypto');

// Import user defined modules
const Class = require('./Class');
const DatabaseConnectionPool = require('./DatabaseConnectionPool');
const Test = require('./Test');

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
	 * The account that created it
	 * @type {Account}
	 */
	account;

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

			conn.close();

			if (!record.length)
				throw new Error('No test template found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			this.account = await this.getAccount();

			return this;
		})();
	}

	getAccount() {
		return new (require('./Account'))(this.accountId);
	}

	async assignClass(classId, date) {
		const c = await new Class(classId);
		const id = crypto.randomUUID();
		const epochDate = date.getTime() / 1000;

		const sql = `
			insert into test(
				testId,
				testTemplateId,
				classId,
				testDate)
			values
				(?, ?, ?, FROM_UNIXTIME(?));
		`;

		const conn = await new DatabaseConnectionPool();

		await conn.runQuery(sql, [
			id,
			this.id,
			c.id,
			epochDate
		]);

		return new Test(id);
	}

	get classes() {

	}

	static async createTestTemplate(accountId, name, maxMark) {
		const a = await new (require('./Account'))(accountId);

		const id = crypto.randomUUID();

		const conn = await new DatabaseConnectionPool();

		const sql = `
			insert into testTemplate(
				testTemplateId,
				accountId,
				name,
				maxMark)
			values
				(?, ?, ?, ?);
		`;

		await conn.runQuery(sql, [
			id,
			a.id,
			name,
			maxMark
		]);

		return new TestTemplate(id);
	}
}

module.exports = TestTemplate;
