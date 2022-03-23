/* eslint-disable no-empty-function, getter-return */
'use strict';

const User = require('./User');

class Parent extends User {
	constructor(conn, id) {
		super(conn, 'parent', id);
	}

	get children() {

	}

	static async createParent(conn, fname, oname, lname, email, password) {
		return await super.createUser(
			conn,
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
