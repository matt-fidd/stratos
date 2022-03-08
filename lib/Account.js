/* eslint-disable no-empty-function, getter-return */
'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

const Class = require('./Class');
const TestTemplate = require('./TestTemplate');
const User = require('./User');

class Account extends User {
	constructor(id) {
		super('account', id);
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

		const conn = await new DatabaseConnectionPool();
		const records = await conn.runQuery(sql, [ this.id ]);

		const promises = records.map(record => {
			return new TestTemplate(record.id);
		});

		const objects = await Promise.all(promises);

		return objects;
	}

	createTestTemplate(name, maxMark) {
		return TestTemplate.createTestTemplate(
			this.id,
			name,
			maxMark);
	}

	createClass(name, subjectId) {
		return Class.createClass(this.id, name, subjectId);
	}

	static async createAccount(fname, oname, lname, email, password) {
		return await super.createUser(
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
