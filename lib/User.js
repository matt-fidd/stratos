'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

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

	type;

	_conn;

	constructor(conn, userId, type = null) {
		type = type ?? false;

		this._conn = conn;

		let types = [];
		let knownType = false;
		if (type) {
			types.push(type);
			knownType = true;
		} else {
			types = [ 'account', 'student', 'parent' ];
		}

		return (async () => {
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

				queryPromises.push(this._conn.runQuery(sql, [
					userId
				]));
			}

			const typeResults = await Promise.all(queryPromises);

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

				return new (require(`./${className}`))(
					this._conn,
					this.id
				);
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

	getEmail() {
		return `${this.fullName} <${this.email}>`;
	}

	async verifyPassword(password) {
		return await bcrypt.compare(password, this.#password);
	}

	async changePassword(password) {
		const newPassword = await User.hashPassword(password);

		const sql = `
			update
				${this.type}
			set
				password = ?
			where
				${this.type}Id = ?;
		`;

		await this._conn.runQuery(sql, [ newPassword, this.id ]);
	}

	generatePasswordReset() {
		return PasswordReset.generatePasswordReset(this._conn, this.id);
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

		const tests = await this._conn.runQuery(sql, [ this.id ]);

		const testObjects = tests.map(test => {
			return new Test(this._conn, test.testId);
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

		const classes = await this._conn.runQuery(sql, [ this.id ]);

		const classObjects = classes.map(c => {
			return new Class(this._conn, c.classId);
		});

		return await Promise.all(classObjects);
	}

	static async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}

	static async createUser(
		conn,
		type,
		fname,
		oname,
		lname,
		email,
		password
	) {
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

		// TODO send emails for new accounts
		let res;
		switch (type) {
			case 'account':
				res = new (require('./Account'))(conn, uuid);
				break;
			case 'student':
				res = new (require('./Student'))(conn, uuid);
				break;
			case 'parent':
				res = new (require('./Parent'))(conn, uuid);
				break;
		}

		return res;
	}

	static async getUserByEmail(conn, email) {
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
				return new (require(`./${className}`))(
					conn,
					id
				);
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
