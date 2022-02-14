'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const DatabaseConnectionPool = require('./DatabaseConnectionPool');
const PasswordReset = require('./PasswordReset');

class User {
	id;
	firstName;
	otherNames;
	lastName;
	email;
	#password;
	type = null;

	constructor(type, userId) {
		type = type ?? false;

		let types = [];
		if (type)
			types.push(type);
		else
			types = [ 'account', 'student', 'parent' ];

		return (async () => {
			for (const type of types) {
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

				const conn = await new DatabaseConnectionPool();
				const res =
					await conn.runQuery(sql, [ userId ]);

				if (!res)
					continue;

				const record = res[0];

				for (const [ k, v ] of Object.entries(record))
					this[k] = v;

				this.type = type;

				return this;
			}
		})();
	}

	get fullName() {

	}

	async verifyPassword(password) {
		return await bcrypt.compare(password, this.password);
	}

	async changePassword(password) {
		const newPassword = await User.hashPassword(password);

		const conn = await new DatabaseConnectionPool();

		const sql = `
			update ${this.type}
			set password = ?
			where ${this.type}Id = ?;
		`;

		await conn.runQuery(sql, [ newPassword, this.id ]);
	}

	getPasswordReset() {

	}

	generatePasswordReset() {
		return PasswordReset.generatePasswordReset(this.id);
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
