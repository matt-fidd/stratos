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

	async verifyPassword(password) {
		return await bcrypt.compare(password, this.password);
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

	static async getUserByEmail(email) {
		const conn = await new DatabaseConnectionPool();
		const types = [ 'account', 'student', 'parent' ];

		for (const type of types) {
			const sql = `
				select ${type}id as id
				from ${type}
				where email = ?;
			`;

			const id = (await conn.runQuery(sql, [
				email
			]))?.[0]?.['id'];

			if (typeof id !== 'undefined') {
				const className =
					`${type.substring(0, 1).toUpperCase()}`
					+ `${type.substring(1)}`;
				return new (require(`./${className}`))(id);
			}
		}

	}
}

module.exports = User;
