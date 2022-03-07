/* eslint-disable no-empty-function, getter-return */
'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

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

	createTestTemplate() {

	}

	createClass() {

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
