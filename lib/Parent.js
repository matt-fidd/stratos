/* eslint-disable no-empty-function, getter-return */
'use strict';

const User = require('./User');

class Parent extends User {
	constructor(id) {
		super('parent', id);
	}

	get children() {

	}

	static async createParent(fname, oname, lname, email, password) {
		return await super.createUser(
			'parent',
			fname,
			oname,
			lname,
			email,
			password
		);
	}
}

module.exports = Parent;
