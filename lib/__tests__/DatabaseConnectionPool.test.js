'use strict';

const DatabaseConnectionPool = require('../DatabaseConnectionPool');

jest.mock('../DatabaseConnectionPool');

describe('DatabaseConnectionPool', () => {
	test('Should instantiate connection', () => {
		new DatabaseConnectionPool();

		expect(DatabaseConnectionPool).toHaveBeenCalledTimes(1);
	});

	test('Non prepared query should not execute with params', () => {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class;`;
		dbp.runQuery(sql);

		expect(dbp.runQuery.mock.results[0].value).toEqual({
			sql: sql
		});
	});

	test('Prepared query should execute along with params', () => {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class where name = ?;`;
		const params = [ 'bob' ];
		dbp.runQuery(sql, params);

		expect(dbp.runQuery.mock.results[0].value).toEqual({
			sql: sql,
			params: params
		});
	});

	test('Query without trailing ; should throw error', () => {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class where name = ?`;
		const params = [ 'bob' ];

		expect(() => dbp.runQuery(sql, params)).toThrow();
	});

	test('Query with whitespace after ; should not fail', ()=> {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class;		`;

		expect(() => dbp.runQuery(sql)).not.toThrow();
	});

	test('Prepared query should fail if no params are given', () => {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class where name = ?;`;

		expect(() => dbp.runQuery(sql)).toThrow();
	});

	test('Prepared query should fail if too many params given', () => {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class where name = ?;`;
		const params = [ 'bob', 'jim' ];

		expect(() => dbp.runQuery(sql, params)).toThrow();
	});

	test('Prepared query should fail if too few params given', () => {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class where name = ?
			and classId = ? and subjectId = ?;`;

		const params = [ 'bob' ];

		expect(() => dbp.runQuery(sql, params)).toThrow();
	});

	test('Non-prepared query should fail if params given', () => {
		const dbp = new DatabaseConnectionPool();

		const sql = `SELECT * FROM class;`;

		const params = [ 'bob', 'jim' ];

		expect(() => dbp.runQuery(sql, params)).toThrow();
	});

	test('Getter for pool exists', () => {
		const dbp = new DatabaseConnectionPool();

		expect(dbp.pool).toBeTrue();
	});
});
