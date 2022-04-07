'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

class PasswordReset {
	userId;

	token;

	nonce;

	expires;

	#conn;

	constructor(conn, userId, token) {
		this.#conn = conn;

		const sql = `
			select
				userId,
				token,
				nonce,
				UNIX_TIMESTAMP(expires) as expires
			from
				passwordReset
			where
				userId = ?
				and token = ?;
		`;

		return (async () => {
			const record = await this.#conn.runQuery(sql, [
				userId,
				token
			]);

			if (!record.length)
				throw new Error('No password reset found');

			for (const [ k, v ] of Object.entries(record[0]))
				this[k] = v;

			return this;
		})();
	}

	get user() {
		return new (require('./User'))(this.#conn, this.userId);
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

	static async generatePasswordReset(conn, userId) {
		const u = await new (require('./User'))(conn, userId);

		let sql = `
			delete from passwordReset
			where userId = ?;
		`;

		let result = await conn.runQuery(sql, [ u.id ]);

		const [ nonce, token ] = await PasswordReset.hashToken(u);

		const d = new Date();
		d.setHours(d.getHours() + 1);
		const expires = d.getTime() / 1000;

		sql = `
			insert into passwordReset
			(
				userId,
				token,
				nonce,
				expires
			)
			values (?, ?, ?, FROM_UNIXTIME(?));
		`;

		result = await conn.runQuery(sql, [
			u.id,
			token,
			nonce,
			expires
		]);

		if (!result)
			throw new Error('Could not create password reset');

		return new PasswordReset(conn, u.id, token);
	}
}

module.exports = PasswordReset;
