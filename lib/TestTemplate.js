/* eslint-disable no-empty-function, getter-return */
'use strict';

const crypto = require('crypto');

// Import user defined modules
const Class = require('./Class');
const { EmailBuilder, Emailer } = require('./Emailer');
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

	async getTests() {
		const sql = `
			select
				testId as id
			from
				test
			where
				testTemplateId = ?;
		`;

		return await Promise.all(
			(await this.#conn.runQuery(sql, [ this.id ]))
				.map(record => {
					return new (require('./Test'))(
						this.#conn,
						record.id);
				})
		);
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

		const t = await new Test(this.#conn, id);

		const email = EmailBuilder.generateFromClass(c)
			.setSubject('Stratos - New Test')
			.setBody(
				`New test added for class ${c.name}:\n` +
				`Test name: ${this.name}\n` +
				`Test date: ${t.getDateString()}\n` +
				`Maximum mark: ${this.maxMark}`
			);

		const emailer = new Emailer();
		await emailer.sendEmail(email);

		return t;
	}

	async setMaxMark(maxMark) {
		const sql = `
			update
				testTemplate
			set
				maxMark = ?
			where
				testTemplateId = ?;
		`;

		await this.#conn.runQuery(sql, [
			maxMark,
			this.id
		]);

		this.maxMark = maxMark;
	}

	async setName(name) {
		const sql = `
			update
				testTemplate
			set
				name = ?
			where
				testTemplateId = ?;
		`;

		await this.#conn.runQuery(sql, [
			name,
			this.id
		]);

		this.name = name;
	}

	async delete() {
		const sql = `
			delete from
				testTemplate
			where
				testTemplateId = ?;
		`;

		try {
			await this.#conn.runQuery(sql, [ this.id ]);
		} catch (e) {
			console.error(e);
		}
	}

	hasAccess(u) {
		return u != null;
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
