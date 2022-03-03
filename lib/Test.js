/* eslint-disable no-empty-function, getter-return */
'use strict';

// Import user defined modules
const DatabaseConnectionPool = require('./DatabaseConnectionPool');

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

	/**
	 * @param {string} testId - The id of the test to fetch
	 */
	constructor(testId) {
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
			const conn = await new DatabaseConnectionPool();
			const record = await conn.runQuery(sql, [
				testId,
			]);

			conn.close();

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
		return new (require('./Class'))(this.classId);
	}

	getTestTemplate() {
		return new (require('./TestTemplate'))(this.templateId);
	}

	get students() {

	}

	calculateAverageScore() {

	}

	calculateGradeBoundaries() {

	}
}

module.exports = Test;
