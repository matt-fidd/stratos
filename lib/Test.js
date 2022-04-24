'use strict';

const { EmailBuilder, Emailer } = require('./Emailer');
const TestResult = require('./TestResult');

/**
 * A class that represents the date of a test
 */
class TestDate extends Date {
	/**
	 * Overwrite the default string casting implementation to format
	 * all dates in the British format
	 *
	 * @returns {string} The formatted date
	 */
	toString() {
		return this.toLocaleDateString('en-GB');
	}
}

class Test {
	/**
	 * The id of the test
	 * @type {string}
	 */
	id;

	/**
	 * The id of the test template it is based on
	 * @type {string}
	 */
	templateId;

	/**
	 * The test template object that it is based on
	 * @type {TestTemplate}
	 */
	template;

	/**
	 * The id of the class it is assigned to
	 * @type {string}
	 */
	classId;

	/**
	 * The class object that it is assigned to
	 * @type {Class}
	 */
	class;

	/**
	 * The test date in epoch seconds
	 * @type {number}
	 */
	epochDate;

	/**
	 * The test date
	 * @type {TestDate}
	 */
	date;

	#conn;

	/**
	 * @param {string} testId - The id of the test to fetch
	 */
	constructor(conn, testId) {
		this.#conn = conn;

		const sql = `
			select
				testId as id,
				testTemplateId as templateId,
				classId,
				UNIX_TIMESTAMP(testDate) as epochDate
			from
				test
			where
				testId = ?;
		`;

		return (async () => {
			const record = await this.#conn.runQuery(sql, [
				testId
			]);

			if (!record.length)
				throw new Error('No test found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			this.date = new TestDate(this.epochDate * 1000);

			const [ template, c ] = await Promise.all([
				this.getTestTemplate(),
				this.getClass()
			]);

			this.template = template;
			this.class = c;

			return this;
		})();
	}

	getClass() {
		return new (require('./Class'))(this.#conn, this.classId);
	}

	getTestTemplate() {
		return new (require('./TestTemplate'))(
			this.#conn,
			this.templateId
		);
	}

	getDateString(long = true) {
		const options = {
			timeZone: 'Europe/London',
			day: 'numeric',
			month: 'numeric',
			year: 'numeric'
		};

		if (long)
			options.weekday = 'long';

		return this.date.toLocaleDateString('en-GB', options);
	}

	async getTestResults() {
		const sql = `
			select
				testResultId
			from
				testResult
			where
				testId = ?;
		`;

		const records = await this.#conn.runQuery(sql, [ this.id ]);

		return Promise.all(records.map(r => {
			return new (require('./TestResult'))(
				this.#conn,
				r.testResultId
			);
		}));
	}

	async getAverageScore() {
		const trs = await this.getTestResults();

		return Math.round(trs.reduce((a, b) => a + b.mark, 0) /
			(trs.length || 1));
	}

	async getAveragePercentage() {
		return Math.round(await this.getAverageScore() /
			this.template.maxMark *
			100);
	}

	async addResult(accountId, studentId, mark) {
		const tr = await TestResult.create(
			this.#conn,
			this.id,
			accountId,
			studentId,
			mark
		);

		const body = 'Your result has been added for ' +
			`the test "${this.template.name}" that you ` +
			`took on ${this.getDateString()}\n\n` +
			`You scored ${mark}/${this.template.maxMark} ` +
			`(${tr.percentage}%) which is a grade ` +
			`${tr.grade}`;

		tr.student.getParents().then(parents => {
			const email = new EmailBuilder()
				.addTo([ tr.student, ...parents ]
					.map(u => u.getEmail()))
				.setSubject('Stratos - Test result added')
				.setBody(body);

			const emailer = new Emailer();
			emailer.sendEmail(email);
		});

		return tr;
	}

	async delete() {
		const sql = `
			delete from
				test
			where
				testId = ?;
		`;

		try {
			await this.#conn.runQuery(sql, [ this.id ]);
		} catch (e) {
			console.error(e);
		}
	}

	async hasAccess(u) {
		const userTests = await u.getTests();

		return userTests.filter(t => {
			return t.id === this.id;
		}).length;
	}
}

module.exports = Test;
