'use strict';

const importJSON = require('../importJSON');
const matchers = require('jest-extended');
const fs = require('fs');

expect.extend(matchers);

describe('importJSON', () => {
	test('Import a file from config dir if no dir param given', () => {
		const loadedFile = importJSON('db.sample');

		expect(loadedFile).toBeObject();
		expect(loadedFile.host).toBe('hostname');
		expect(loadedFile.port).toBeNumber();
		expect(loadedFile.port).toBe(1111);
	});

	test('Import a file from specified dir', () => {
		const loadedFile = importJSON('db.sample', 'config');

		expect(loadedFile).toBeObject();
		expect(loadedFile.host).toBe('hostname');
		expect(loadedFile.port).toBeNumber();
		expect(loadedFile.port).toBe(1111);
	});

	test('Fail if file doesn\'t exist', () => {
		expect(() => importJSON('bob'))
			.toThrowError('Missing file');
	});

	test('Fail if file is malformed', () => {
		fs.mkdirSync('config/test');
		fs.writeFileSync('config/test/test.json', 'bob');

		expect(() => importJSON('test', 'config/test'))
			.toThrowError('Malformed file');

		fs.rmSync('config/test', { recursive: true });
	});
});
