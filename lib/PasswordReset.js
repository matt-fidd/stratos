'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

class PasswordReset {
	userId;
	token;
	nonce;
	expires;

	constructor(userId) {
		const sql = `
			select
				token,
				nonce,
				expires,
				userId
			from passwordReset
			where
				userId = ?;
		`;

		return (async () => {
			const conn = await new DatabaseConnectionPool();
			const record = await conn.runQuery(sql, [ userId ]);

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			return this;
		})();
	}

	get user() {

	}

	static async hashToken(u) {
		const nonce = crypto
			.randomBytes(16)
			.toString('hex')
			.slice(0, 16);

		const tokenString = u.id + u.email + nonce + u.lastName;
		const token = await bcrypt.hash(tokenString, 10);

		return [ nonce, token ];
	}

	static generatePasswordReset() {

	}
}

module.exports = PasswordReset;
