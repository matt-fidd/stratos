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
	 *
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
	 * Sanitise and validate an sql query
	 *
	 * @param {string} sql The query to be executed
	 * @param {(Array<string|number>)} Values to replace prepared statement
	 *
	 * @return {string} Sanitised and validated sql query
	 */
	static validateQuery(sql, params) {
		sql = sql.trim();

		if (sql.slice(-1) !== ';')
			throw new Error('Query needs trailing ;');

		const expectedParams = sql.split('?').length - 1;
		const prepared = expectedParams > 0;

		if (!prepared && typeof params !== 'undefined') {
			throw new Error('Can not pass in parameters ' +
				'for a non-prepared statement');
		} else if (prepared && params.length !== expectedParams) {
			throw new Error('Number of params does not equal ' +
				'expected number');
		}

		return sql;
	}

	/**
	 * Run a query against the database connection
	 *
	 * @param {string} sql The query to be executed
	 * @param {(Array<string|number>)} Values to replace prepared statement
	 *
	 * @return {(Array<object>|object)} Data returned from the database
	 */
	async runQuery(sql, params) {
		sql = this.validateQuery(sql, params);
		const prepared = sql.includes('?');

		let data;
		if (!prepared) {
			[ data ] = await this.#connectionPool.execute(sql);
		} else {
			[ data ] =
				await this.#connectionPool.execute(sql, params);
		}

		return data;
	}

	/**
	 * Expose the database connection pool
	 * @type {Object}
	 */
	get pool() {
		return this.#connectionPool;
	}

	/**
	 * Close the connection to the database
	 */
	async close() {
		await this.#connectionPool.end();
	}
}

module.exports = DatabaseConnectionPool;
