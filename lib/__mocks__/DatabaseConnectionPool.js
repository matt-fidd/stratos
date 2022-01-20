'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

/**
 * Sanitise and validate an sql query
 *
 * @param {string} sql The query to be executed
 * @param {(Array<string|number>)} Values to replace prepared statement
 *
 * @return {string} Sanitised and validated sql query
 */
function validateQuery(sql, params) {
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

const mockRunQuery = jest.fn((sql, params) => {
	sql = validateQuery(sql, params);
	const prepared = sql.includes('?');

	let data;
	if (!prepared) {
		data = {
			sql: sql
		};
	} else {
		data = {
			sql: sql,
			params: params
		};
	}

	return data;
});

const mockClose = jest.fn();

jest.mock('./DatabaseConnectionPool', () => {
	return jest.fn().mockImplementation(() => {
		return {
			runQuery: mockRunQuery,
			close: mockClose
		};
	});
});

module.exports = DatabaseConnectionPool;
