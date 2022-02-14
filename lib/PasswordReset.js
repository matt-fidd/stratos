'use strict';

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

	static hashToken(password) {

	}

	static generatePasswordReset() {

	}
}

module.exports = PasswordReset;
