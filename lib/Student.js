/* eslint-disable no-empty-function, getter-return */
'use strict';

const User = require('./User');

class Student extends User {
	constructor(conn, id) {
		super(conn, id, 'student');
	}

	async getTestResults() {
		const sql = `
			select
				testResultId
			from
				testResult
			where
				studentId = ?
			order by
				time desc;
		`;

		const records = await this._conn.runQuery(sql, [ this.id ]);

		return Promise.all(records.map(r => {
			return new (require('./TestResult'))(
				this._conn,
				r.testResultId
			);
		}));
	}

	static async createStudent(conn, fname, oname, lname, email, password) {
		return await super.createUser(
			conn,
			'student',
			fname,
			oname,
			lname,
			email,
			password
		);
	}
}

module.exports = Student;
