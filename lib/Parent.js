'use strict';

const User = require('./User');

class Parent extends User {
	constructor(conn, id) {
		super(conn, id, 'parent');
	}

	async getChildren(fetchObjects = true) {
		const sql = `
			select
				studentId
			from
				studentParentLink
			where
				parentId = ?;
		`;

		const children = await this._conn.runQuery(sql, [ this.id ]);

		const childrenIds = children.map(c => c.studentId);

		if (!fetchObjects)
			return childrenIds;

		return await Promise.all(childrenIds.map(id => {
			return new User(this._conn, id, 'student');
		}));
	}

	static async createParent(conn, fname, oname, lname, email, password) {
		return await super.createUser(
			conn,
			'parent',
			fname,
			oname,
			lname,
			email,
			password
		);
	}
}

module.exports = Parent;
