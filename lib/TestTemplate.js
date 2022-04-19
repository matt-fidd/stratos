/* eslint-disable no-empty-function, getter-return */
'use strict';

const crypto = require('crypto');

// Import user defined modules
const Class = require('./Class');
const Test = require('./Test');
const GradeBoundaries = require('./GradeBoundaries');

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

	gradeBoundaries;

	#conn;

	/**
	 * @param {string} testTemplateId - The id of the template to fetch
	 */
	constructor(conn, testTemplateId) {
		this.#conn = conn;

		const sql = `
			select
				testTemplateId as id,
				accountId,
				name,
				maxMark,
				gradeBoundaries
			from
				testTemplate
			where
				testTemplateId = ?;
		`;

		return (async () => {
			const record = await this.#conn.runQuery(sql, [
				testTemplateId
			]);

			if (!record.length)
				throw new Error('No test template found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v ?? undefined;

			if (this.gradeBoundaries) {
				this.gradeBoundaries =
					JSON.parse(this.gradeBoundaries);
			}

			this.gradeBoundaries =
				new GradeBoundaries(this.gradeBoundaries);

			this.account = await this.getAccount();

			return this;
		})();
	}

	getAccount() {
		return new (require('./Account'))(this.#conn, this.accountId);
	}

	async assignClass(classId, date) {
		const c = await new Class(this.#conn, classId);
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

		await this.#conn.runQuery(sql, [
			id,
			this.id,
			c.id,
			epochDate
		]);

		return new Test(this.#conn, id);
	}

	get classes() {

	}

	static async createTestTemplate(conn, accountId, name, maxMark) {
		const a = await new (require('./Account'))(conn, accountId);

		const id = crypto.randomUUID();

		const sql = `
			insert into testTemplate(
				testTemplateId,
				accountId,
				name,
				maxMark)
			values
				(?, ?, ?, ?);
		`;

		const result = await conn.runQuery(sql, [
			id,
			a.id,
			name,
			maxMark
		]);

		if (!result)
			throw new Error('Could not create test template');

		return new TestTemplate(conn, id);
	}
}

module.exports = TestTemplate;
