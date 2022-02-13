'use strict';

const User = require('./User');

class Account extends User {
	constructor(id) {
		super('account', id);
	}

	get classes() {

	}

	get testTemplates() {

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
