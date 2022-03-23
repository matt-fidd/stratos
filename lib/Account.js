/* eslint-disable no-empty-function, getter-return */
'use strict';

const Class = require('./Class');
const TestTemplate = require('./TestTemplate');
const User = require('./User');

class Account extends User {
	constructor(conn, id) {
		super(conn, 'account', id);
	}

	async getTestTemplates() {
		const sql = `
			select
				testTemplateId as id
			from
				testTemplate
			where
				accountId = ?;
		`;

		const records = await this._conn.runQuery(sql, [ this.id ]);

		const promises = records.map(record => {
			return new TestTemplate(this._conn, record.id);
		});

		const objects = await Promise.all(promises);

		return objects;
	}

	createTestTemplate(name, maxMark) {
		return TestTemplate.createTestTemplate(
			this._conn,
			this.id,
			name,
			maxMark);
	}

	createClass(name, subjectId) {
		return Class.createClass(this._conn, this.id, name, subjectId);
	}

	static async createAccount(conn, fname, oname, lname, email, password) {
		return await super.createUser(
			conn,
			'account',
			fname,
			oname,
			lname,
			email,
			password
		);
	}
}

module.exports = Account;
