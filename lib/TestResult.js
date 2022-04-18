'use strict';

class TestResult {
	id;

	studentId;

	student;

	accountId;

	account;

	testId;

	test;

	time;

	#mark;

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

	set mark(mark) {
		//TODO handle saving mark
		this.#mark = mark;
	}

	get mark() {
		return this.#mark;
	}

	get percentage() {
		return (
			parseInt(this.#mark) /
			parseInt(this.test.template.maxMark) *
			100
		);
	}

	get grade() {
		//TODO get actual grades
		return 'C';
	}
}

module.exports = TestResult;
