'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

const Class = require('./Class');
const PasswordReset = require('./PasswordReset');
const Test = require('./Test');

class User {
	id;

	firstName;

	otherNames;

	lastName;

	shortName;

	fullName;

	email;

	#password;

	type = null;

	constructor(type, userId) {
		type = type ?? false;

		let types = [];
		let knownType = false;
		if (type) {
			types.push(type);
			knownType = true;
		} else {
			types = [ 'account', 'student', 'parent' ];
		}

		return (async () => {
			const conn = await new DatabaseConnectionPool();
			const queryPromises = [];

			for (const type of types) {
				const sql = `
					select
						email,
						firstName,
						otherNames,
						lastName,
						password,
						${type}Id as id
					from
						${type}
					where
						${type}Id = ?;
				`;

				queryPromises.push(conn.runQuery(sql, [
					userId
				]));
			}

			const typeResults = await Promise.all(queryPromises);
			conn.close();

			for (const [ i, result ] of typeResults.entries()) {
				if (!result.length)
					continue;

				const record = result[0];
				const type = types[i];

				for (const [ k, v ] of Object.entries(record)) {
					if (k === 'password')
						this.#password = v;
					else
						this[k] = v;
				}

				this.type = type;
				this.shortName = this.getShortName();
				this.fullName = this.getFullName();

				if (knownType)
					return this;

				const className =
					`${type.substring(0, 1).toUpperCase()}`+
					`${type.substring(1)}`;

				return new (require(`./${className}`))(this.id);
			}

			throw new Error('No user found');
		})();
	}

	getFullName() {
		let name = `${this.firstName} `;

		if (this?.otherNames?.length > 0)
			name += `${this.otherNames} `;

		name += this.lastName;

		return name;
	}

	getShortName() {
		return `${this.firstName} ${this.lastName}`;
	}

	async verifyPassword(password) {
		return await bcrypt.compare(password, this.#password);
	}

	async changePassword(password) {
		const newPassword = await User.hashPassword(password);

		const conn = await new DatabaseConnectionPool();

		const sql = `
			update
				${this.type}
			set
				password = ?
			where
				${this.type}Id = ?;
		`;

		await conn.runQuery(sql, [ newPassword, this.id ]);
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

	async getTests({ order='desc', range='all' } = {}) {
		const validOrder = [ 'asc', 'desc' ];
		const validRange = [ 'all', 'before', 'after' ];

		if (this.type === 'parent')
			throw new Error(`Can not fetch tests for ${this.type}`);

		if (!validOrder.includes(order))
			throw new Error('Invalid order');

		if (!validRange.includes(range))
			throw new Error('Invalid range');

		let sql = `
			select
				t.testId as testId
			from
				test t
				join ${this.type}ClassLink link using(classId)
			where
				link.${this.type}Id = ?
		`;

		switch (range) {
			case 'before':
				sql += 'and t.testDate <= curdate()';
				break;
			case 'after':
				sql += 'and t.testDate > curdate()';
				break;
		}

		sql += `order by t.testDate  ${order};`;

		const conn = await new DatabaseConnectionPool();
		const tests = await conn.runQuery(sql, [ this.id ]);

		const testObjects = tests.map(test => {
			return new Test(test.testId);
		});

		return await Promise.all(testObjects);
	}

	async getClasses() {
		if (this.type === 'parent')
			throw new Error(`Can not fetch class for ${this.type}`);

		const sql = `
			select
				c.classId as classId
			from
				class c
				join ${this.type}ClassLink link using(classId)
			where
				link.${this.type}Id = ?
			order by
				c.name;
		`;

		const conn = await new DatabaseConnectionPool();
		const classes = await conn.runQuery(sql, [ this.id ]);

		const classObjects = classes.map(c => {
			return new Class(c.classId);
		});

		return await Promise.all(classObjects);
	}

	static async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}

	static async createUser(type, fname, oname, lname, email, password) {
		const conn = await new DatabaseConnectionPool();

		const uuid = crypto.randomUUID();
		const hashedPassword = await User.hashPassword(password);

		const sql = `
			insert into ${type}(
				${type}Id,
				email,
				firstName,
				otherNames,
				lastName,
				password)
			values
				(?, ?, ?, ?, ?, ?);
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

		const idPromises = [];

		for (const type of types) {
			const sql = `
				select
					${type}id as id
				from
					${type}
				where
					email = ?;
			`;

			idPromises.push(conn.runQuery(sql, [
				email
			]));
		}

		const ids = await Promise.all(idPromises);

		for (const [ i, records ] of ids.entries()) {
			const type = types[i];
			const id = records?.[0]?.id;

			if (typeof id !== 'undefined') {
				const className =
					`${type.substring(0, 1).toUpperCase()}`+
					`${type.substring(1)}`;
				return new (require(`./${className}`))(id);
			}
		}
	}

	async hasAccess(u) {
		let [ userClasses, thisClasses ] = await Promise.all([
			u.getClasses(),
			this.getClasses()
		]);

		userClasses = userClasses.map(c => c.id);

		return thisClasses.filter(c =>
			userClasses.includes(c.id)
		).length > 0;
	}
}

module.exports = User;
