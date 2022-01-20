'use strict';

class User {
	id;
	firstName;
	otherNames;
	lastName;
	email;
	#password;
	type = null;

	constructor(type, userId) {

	}

	get fullName() {

	}

	verifyPassword(hash) {

	}

	changePassword(password) {

	}

	getPasswordReset() {

	}

	generatePasswordReset() {

	}

	login() {

	}

	static hashPassword(password) {

	}

	static createUser() {

	}

	static getUserByEmail() {

	}
}

module.exports = User;
