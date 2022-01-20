'use strict';

const DatabaseConnectionPool = require('./DatabaseConnectionPool');

const mockRunQuery = jest.fn((sql, params) => {
	sql = sql.trim();

	if (sql.slice(-1) !== ';')
		throw new Error('Invalid query, needs trailing ;');

	// Execute as non-prepared if no params are supplied
	if (typeof params === 'undefined') {
		return {
			sql: sql
		};
	}

	return {
		sql: sql,
		params: params
	};
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
