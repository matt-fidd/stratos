'use strict';

const validator = require('../validator');

describe('validEmail', () => {
	test('Valid email address', () => {
		const email = 'bob@bob.com';

		expect(validator.validEmail(email)).toBeTrue();
	});

	test('Invalid email address', () => {
		const email = 'bobbobcom';

		expect(validator.validEmail(email)).toBeFalse();
	});

	test('Invalid email address with @', () => {
		const email = 'bob@bobcom';

		expect(validator.validEmail(email)).toBeFalse();
	});

	test('Obscure valid email address', () => {
		const email = 'jimmy.bob+joe@google.edu.gov.uk';

		expect(validator.validEmail(email)).toBeTrue();
	});

	test('Even more obscure valid email address', () => {
		// TODO more obscure email address
		const email = 'bob@bob.com';

		expect(validator.validEmail(email)).toBeTrue();
	});
});

describe('passwordsMatch', () => {
	test('Passwords match', () => {
		const p1 = 'password123';

		expect(validator.passwordsMatch(p1, p1)).toBeTrue();
	});

	test('Passwords do not match', () => {
		const p1 = 'bobby';
		const p2 = 'jimmy';

		expect(validator.passwordsMatch(p1, p2)).toBeFalse();
	});

	test('Passwords match and contain special characters', () => {
		const p1 = 'p2 ssw_0 rd&--1  t3';

		expect(validator.passwordsMatch(p1, p1)).toBeTrue();
	});

	test('Passwords do not match and contain special characters', () => {
		const p1 = 'p2ssw_0rd&--1t3';
		const p2 = 'this-is.././really 99(not) +the+[same';

		expect(validator.passwordsMatch(p1, p2)).toBeFalse();
	});

	test('Passwords match but are not strings', () => {
		const p1 = { password: 'password123' };

		expect(validator.passwordsMatch(p1, p1)).toBeFalse();
	});

	test('Passwords do not match and are not strings', () => {
		const p1 = { password: 'password123' };
		const p2 = { password: 'this is not the same' };

		expect(validator.passwordsMatch(p1, p2)).toBeFalse();
	});

	test('Passwords do not match but differ by whitespace', () => {
		const p1 = 'password123';
		const p2 = 'password 123';

		expect(validator.passwordsMatch(p1, p2)).toBeFalse();
	});
});

describe('validate', () => {
	test('All required fields filled in', () => {
		const body = {
			name: 'Bob',
			message: 'Hi Jim!'
		};

		const fields = [
			'name',
			'message'
		];

		const result = validator.validate(body, fields);

		expect(result).toBeObject();
		expect(result).toContainKey('fields');
		expect(result.fields.get('name')).toBe('Bob');
		expect(result.fields.get('message')).toBe('Hi Jim!');
	});

	test('Required fields missing', () => {
		const body = {
			dob: '01/01/01'
		};

		const fields = [
			'name',
			'message'
		];

		expect(() => {
			validator.validate(body, fields);
		}).toThrow('missing');
	});

	test('Valid email validation', () => {
		const body = {
			name: 'Bob',
			message: 'Hi Jim!',
			email: 'bob@bob.com'
		};

		const fields = [
			'name',
			'message',
			'email'
		];

		const validation = {
			email: 'email'
		};

		const result = validator.validate(body, fields, validation);

		expect(result).toBeObject();
		expect(result).toContainKey('fields');
		expect(result.fields.get('email')).toBe('bob@bob.com');
	});

	test('Invalid email validation', () => {
		const body = {
			name: 'Bob',
			message: 'Hi Jim!',
			email: 'bobbobcom'
		};

		const fields = [
			'name',
			'message',
			'email'
		];

		const validation = {
			email: 'email'
		};

		expect(() => {
			validator.validate(body, fields, validation);
		}).toThrow('Invalid');
	});

	test('Valid password validation', () => {
		const body = {
			name: 'Bob',
			message: 'Hi Jim!',
			p1: 'bob',
			p2: 'bob'
		};

		const fields = [
			'name',
			'message',
			'p1',
			'p2'
		];

		const validation = {
			password: [ 'p1', 'p2' ]
		};

		const result = validator.validate(body, fields, validation);

		expect(result).toBeObject();
		expect(result).toContainKey('fields');
		expect(result.fields.get('p1')).toBe('bob');
		expect(result.fields.get('p2')).toBe('bob');
	});

	test('Invalid password validation', () => {
		const body = {
			name: 'Bob',
			message: 'Hi Jim!',
			p1: 'bob',
			p2: 'jim'
		};

		const fields = [
			'name',
			'message',
			'p1',
			'p2'
		];

		const validation = {
			password: [ 'p1', 'p2' ]
		};

		expect(() => {
			validator.validate(body, fields, validation);
		}).toThrow('Invalid');
	});

	test('Invalid validation type', () => {
		const body = {
			name: 'Bob',
			message: 'Hi Jim!'
		};

		const fields = [
			'name',
			'message'
		];

		const validation = {
			joeseph: []
		};

		expect(() => {
			validator.validate(body, fields, validation);
		}).toThrow('Invalid validation type');
	});
});

