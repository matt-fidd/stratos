/* eslint-disable no-empty-function, getter-return */
'use strict';

const User = require('./User');

class Student extends User {
	constructor(conn, id) {
		super(conn, id, 'student');
	}

	get classes() {

	}

	get parents() {

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
