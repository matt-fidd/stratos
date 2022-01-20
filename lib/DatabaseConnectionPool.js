'use strict';

// Import required modules
const mysql = require('mysql2/promise');
const path = require('path');

// Import the database connection options from config/db.json
let defaultDbOptions;
try {
	defaultDbOptions = require(
		path.join(__dirname, '../config/db.json'));
} catch (e) {
	console.log(e);
	throw new Error('Missing or malformed config ' +
		'(config/db.json)');
}

/**
 * A class representing a pool of database connections
 */
class DatabaseConnectionPool {
	#dbOptions;
	#connectionPool;

	/**
	 * Create a database connection pool
	 * @param {object} [dbOptions] Optional database params to connect with
	 */
	constructor(dbOptions) {
		// Use default options if none are passed into the constructor
		if (typeof dbOptions === 'undefined')
			this.#dbOptions = defaultDbOptions;

		return (async () => {
			this.#connectionPool =
				await mysql.createPool(this.#dbOptions);

			return this;
		})();
	}

	/**
	 * Run a query against the database connection
	 * @param {string} sql The query to be executed
	 * @param {(Array<string|number>)} Values to replace prepared statement
	 * @return {(Array<object>|object)} Data returned from the database
	 */
	async runQuery(sql, params) {
		sql = sql.trim();

		if (sql.slice(-1) !== ';')
			throw new Error('Invalid query, needs trailing ;');

		// Execute as non-prepared if no params are supplied
		if (typeof params === 'undefined') {
			const [ data ] =
				await this.#connectionPool.execute(sql);
			return data;
		}

		const [ data ] =
			await this.#connectionPool.execute(sql, params);
		return data;
	}

	/**
	 * Close the connection to the database
	 */
	async close() {
		await this.#connectionPool.end();
	}
}

module.exports = DatabaseConnectionPool;
