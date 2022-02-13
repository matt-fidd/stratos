'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

class User {
	id;
	firstName;
	otherNames;
	lastName;
	email;
	#password;
	type = null;

	constructor(type, userId) {
		const sql = `
			select
				email,
				firstName,
				otherNames,
				lastName,
				password,
				accountId as id
			from ${type}
			where
				${type}Id = ?;
		`;

		this.type = type;

		return (async () => {
			const conn = await new DatabaseConnectionPool();
			const record = await conn.runQuery(sql, [ userId ]);

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			return this;
		})();
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
