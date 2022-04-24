'use strict';

const crypto = require('crypto');

const { EmailBuilder, Emailer } = require('./Emailer');
const MySQLDate = require('./MySQLDate');

class TestResult {
	id;

	studentId;

	student;

	accountId;

	account;

	testId;

	test;

	time;

	mark;

	#conn;

	#loaded = false;

	constructor(conn, id) {
		this.#conn = conn;

		const sql = `
			select
				testResultId as id,
				studentId,
				testId,
				accountId,
				mark,
				time
			from
				testResult
			where
				testResultId = ?;
		`;

		return (async () => {
			const record = await this.#conn.runQuery(sql, [ id ]);

			if (!record.length)
				throw new Error('No test result found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			await this.load();

			return this;
		})();
	}

	#getObject(classFile, id) {
		return new (require(`./${classFile}`))(this.#conn, id);
	}

	async load() {
		if (this.#loaded)
			return;

		[
			this.student,
			this.account,
			this.test
		] = await Promise.all([
			this.#getObject('Student', this.studentId),
			this.#getObject('Account', this.accountId),
			this.#getObject('Test', this.testId)
		]);

		this.#loaded = true;
	}

	async setMark(mark) {
		const sql = `
			update
				testResult
			set
				mark = ?,
				time = ?
			where
				testResultId = ?;
		`;

		await this.#conn.runQuery(sql, [
			mark,
			new MySQLDate(),
			this.id
		]);

		let body = 'Your result has been changed for ' +
			`the test "${this.test.template.name}" ` +
			'that you took on ' +
			`${this.test.getDateString()}\n\n` +
			`Your previous result was ${this.mark}/` +
			`${this.test.template.maxMark} ` +
			`(${this.percentage}%) which was a grade ` +
			`${this.grade}\n\n`;

		this.mark = mark;

		body += `Your new result is ${this.mark}/` +
			`${this.test.template.maxMark} ` +
			`(${this.percentage}%) which is a grade ` +
			`${this.grade}`;

		this.student.getParents().then(parents => {
			const email = new EmailBuilder()
				.addTo([ this.student, ...parents ]
					.map(u => u.getEmail()))
				.setSubject('Stratos - Test result changed')
				.setBody(body);

			const emailer = new Emailer();
			emailer.sendEmail(email);
		});
	}

	get percentage() {
		return Math.round(
			parseInt(this.mark) /
			parseInt(this.test.template.maxMark) *
			100
		);
	}

	get grade() {
		return this.test.template.gradeBoundaries.getGrade(
			this.percentage);
	}

	delete() {
		const sql = `
			delete from
				testResult
			where
				testResultId = ?;
		`;

		this.#conn.runQuery(sql, [ this.id ]);
	}

	static async create(conn, testId, accountId, studentId, mark) {
		const sql = `
			insert into testResult
			(
				testResultId,
				studentId,
				testId,
				accountId,
				mark,
				time
			)
			values (?, ?, ?, ?, ?, ?);
		`;

		const id = await crypto.randomUUID();

		await conn.runQuery(sql, [
			id,
			studentId,
			testId,
			accountId,
			mark,
			new MySQLDate()
		]);

		return new TestResult(conn, id);
	}
}

module.exports = TestResult;
