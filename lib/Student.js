'use strict';

const User = require('./User');

class Student extends User {
	constructor(id) {
		super('student', id);
	}

	get classes() {

	}

	get tests() {

	}

	get parents() {

	}

	static async createStudent(fname, oname, lname, email, password) {
		return await super.createUser(
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
