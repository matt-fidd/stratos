'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

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

	login(req) {
		req.session.authenticated = true;
		req.session.userId = this.id;
		req.session.userType = this.type;
		req.session.fullName = `${this.firstName} ${this.lastName}`;
	}

	static async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}

	static async createUser(type, fname, oname, lname, email, password) {
		const conn = await new DatabaseConnectionPool();

		const uuid = crypto.randomUUID();
		const hashedPassword = await User.hashPassword(password);

		const sql = `
			insert into ${type} (
				${type}Id,
				email,
				firstName,
				otherNames,
				lastName,
				password)
			VALUES (?, ?, ?, ?, ?, ?);
		`;

		await conn.runQuery(sql, [
			uuid,
			email,
			fname,
			oname,
			lname,
			hashedPassword
		]);

		let res;
		switch (type) {
			case 'account':
				res = new (require('./Account'))(uuid);
				break;
			default:
				throw new Error(
					`Cannot create user of type ${type}`);
		}

		return res;
	}

	static getUserByEmail() {

	}
}

module.exports = User;
