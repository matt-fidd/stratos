'use strict';

// Import required modules
const path = require('path');

// Import user defined modules
const DatabaseConnectionPool =
	require(path.join(__dirname, '../../lib/DatabaseConnectionPool'));

// Import test data object
const { data } = require('./testData');

/**
 * cleanDb() Removes all records from the tables in the database to be inserted
 * into
 *
 * @return {void}
 */
async function cleanDb() {
	const conn = await new DatabaseConnectionPool();

	// Remove records from tables in reverse order to which they depend on
	// each other
	const tables = Object.keys(data).reverse();
	tables.push('sessions');

	for (const table of tables)
		await conn.runQuery(`DELETE FROM ${table};`);

	conn.close();
}

module.exports = cleanDb;
