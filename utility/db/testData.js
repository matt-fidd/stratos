'use strict';

// Import user defined modules
const MySQLDate = require('../../lib/MySQLDate');

// Object storing configurations for the db tables
const details = {
	parent: {
		hashPassword: true,
		id: 'uuid'
	},
	student: {
		hashPassword: true,
		id: 'uuid'
	},
	class: {
		id: 'uuid'
	},
	account: {
		hashPassword: true,
		id: 'uuid'
	},
	testTemplate: {
		id: 'uuid'
	},
	test: {
		id: 'uuid'
	},
	studentParentLink: {
		link: true
	},
	studentClassLink: {
		link: true
	},
	accountClassLink: {
		link: true
	},
	testResult: {
		id: 'uuid'
	}
};

// Object to store all of the test data to be inserted
const data = {
	parent: [
		{
			email: 'p1@stratos.com',
			firstName: 'Pauline',
			otherNames: 'Logan',
			lastName: 'McKenzie',
			password: 'p1'
		},
		{
			email: 'p2@stratos.com',
			firstName: 'Jeffery',
			otherNames: null,
			lastName: 'Jonas',
			password: 'p2'
		},
		{
			email: 'p3@stratos.com',
			firstName: 'Mohammad',
			otherNames: null,
			lastName: 'Gamble',
			password: 'p3'
		},
		{
			email: 'p4@stratos.com',
			firstName: 'Abiel',
			otherNames: 'Judas',
			lastName: 'Macias',
			password: 'p4'
		},
		{
			email: 'p5@stratos.com',
			firstName: 'Darius',
			otherNames: null,
			lastName: 'Tanz',
			password: 'p5'
		},
	],
	student: [
		{
			email: 's1@stratos.com',
			firstName: 'Emilio',
			otherNames: 'Melville',
			lastName: 'Caradonna',
			password: 's1'
		},
		{
			email: 's2@stratos.com',
			firstName: 'Ola',
			otherNames: null,
			lastName: 'Larson',
			password: 's2'
		},
		{
			email: 's3@stratos.com',
			firstName: 'Eduard',
			otherNames: 'Vaughn',
			lastName: 'Koleno',
			password: 's3'
		},
		{
			email: 's4@stratos.com',
			firstName: 'Huo',
			otherNames: null,
			lastName: 'Ding',
			password: 's4'
		},
		{
			email: 's5@stratos.com',
			firstName: 'Carson',
			otherNames: 'Killian James',
			lastName: 'O\'Mulrian',
			password: 's5'
		},

	],
	subject: [
		{
			name: 'English'
		},
		{
			name: 'Mathematics'
		},
		{
			name: 'Further Mathematics'
		},
		{
			name: 'Chemistry'
		},
		{
			name: 'Computer Science'
		},
		{
			name: 'Electronics'
		},
	],
	class: [
		{
			name: '12B1/English',
			subjectId: 1
		},
		{
			name: '7.4 - CompSci',
			subjectId: 5
		},
		{
			name: '9(5) Electronics',
			subjectId: 6
		},
		{
			name: '13(6)',
			subjectId: 4
		},

	],
	account: [
		{
			email: 'a1@stratos.com',
			firstName: 'Aurick',
			otherNames: null,
			lastName: 'Rubner',
			password: 'a1'
		},
		{
			email: 'a2@stratos.com',
			firstName: 'Daronte',
			otherNames: 'Jogi',
			lastName: 'Watts',
			password: 'a2'
		},
		{
			email: 'a3@stratos.com',
			firstName: 'Devajee',
			otherNames: null,
			lastName: 'Vaughn',
			password: 'a3'
		},
		{
			email: 'a4@stratos.com',
			firstName: 'Bob',
			otherNames: null,
			lastName: 'Doe',
			password: 'a4'
		},
	],
	testTemplate: [
		{
			name: 'Test Template 1',
			maxMark: 100,
			lookups: {
				accountId: 1
			}
		},
		{
			name: 'Test Template 2',
			maxMark: 50,
			lookups: {
				accountId: 2
			}
		},
		{
			name: 'Test Template 3',
			maxMark: 74,
			lookups: {
				accountId: 2
			}
		},
		{
			name: 'Test Template 4',
			maxMark: 320,
			lookups: {
				accountId: 3
			}
		}
	],
	test: [
		{
			testDate: new MySQLDate(),
			lookups: {
				classId: 1,
				testTemplateId: 1
			}
		},
		{
			testDate: new MySQLDate().alterDays(1),
			lookups: {
				classId: 2,
				testTemplateId: 1
			}
		},
		{
			testDate: new MySQLDate().alterDays(30),
			lookups: {
				classId: 4,
				testTemplateId: 1
			}
		},
		{
			testDate: new MySQLDate().alterDays(-10),
			lookups: {
				classId: 1,
				testTemplateId: 4
			}
		},
		{
			testDate: new MySQLDate().alterDays(-100),
			lookups: {
				classId: 1,
				testTemplateId: 2
			}
		},
		{
			testDate: new MySQLDate().alterDays(50),
			lookups: {
				classId: 4,
				testTemplateId: 2
			}
		},
		{
			testDate: new MySQLDate().alterDays(10),
			lookups: {
				classId: 4,
				testTemplateId: 3
			}
		},
		{
			testDate: new MySQLDate().alterDays(-15),
			lookups: {
				classId: 3,
				testTemplateId: 3
			}
		},
		{
			testDate: new MySQLDate().alterDays(-108),
			lookups: {
				classId: 3,
				testTemplateId: 3
			}
		},
		{
			testDate: new MySQLDate().alterDays(-4),
			lookups: {
				classId: 2,
				testTemplateId: 4
			}
		},
		{
			testDate: new MySQLDate().alterDays(-8),
			lookups: {
				classId: 3,
				testTemplateId: 4
			}
		},
		{
			testDate: new MySQLDate().alterDays(1),
			lookups: {
				classId: 3,
				testTemplateId: 4
			}
		},
	],
	studentParentLink: [
		{
			lookups: {
				studentId: 1,
				parentId: 1
			}
		},
		{
			lookups: {
				studentId: 2,
				parentId: 2
			}
		},
		{
			lookups: {
				studentId: 2,
				parentId: 3
			}
		},
		{
			lookups: {
				studentId: 3,
				parentId: 4
			}
		},
		{
			lookups: {
				studentId: 4,
				parentId: 4
			}
		},
		{
			lookups: {
				studentId: 4,
				parentId: 5
			}
		},
		{
			lookups: {
				studentId: 5,
				parentId: 5
			}
		}
	],
	studentClassLink: [
		{
			lookups: {
				studentId: 1,
				classId: 1
			}
		},
		{
			lookups: {
				studentId: 2,
				classId: 1
			}
		},
		{
			lookups: {
				studentId: 3,
				classId: 1
			}
		},
		{
			lookups: {
				studentId: 4,
				classId: 1
			}
		},
		{
			lookups: {
				studentId: 5,
				classId: 1
			}
		},
		{
			lookups: {
				studentId: 1,
				classId: 2
			}
		},
		{
			lookups: {
				studentId: 2,
				classId: 2
			}
		},
		{
			lookups: {
				studentId: 1,
				classId: 3
			}
		},
		{
			lookups: {
				studentId: 2,
				classId: 3
			}
		},
		{
			lookups: {
				studentId: 3,
				classId: 3
			}
		},
		{
			lookups: {
				studentId: 4,
				classId: 4
			}
		},
		{
			lookups: {
				studentId: 5,
				classId: 4
			}
		},
	],
	accountClassLink: [
		{
			lookups: {
				accountId: 1,
				classId: 1,
			}
		},
		{
			lookups: {
				accountId: 1,
				classId: 2,
			}
		},
		{
			lookups: {
				accountId: 2,
				classId: 2,
			}
		},
		{
			lookups: {
				accountId: 3,
				classId: 3,
			}
		},
		{
			lookups: {
				accountId: 1,
				classId: 4,
			}
		},
		{
			lookups: {
				accountId: 2,
				classId: 4,
			}
		},
		{
			lookups: {
				accountId: 3,
				classId: 4,
			}
		},
	],
	testResult: [
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 1,
				testId: 2,
				accountId: 1
			}
		},
		{
			mark: 70,
			time: new MySQLDate(),
			lookups: {
				studentId: 2,
				testId: 2,
				accountId: 1
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 1,
				testId: 5,
				accountId: 1
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 2,
				testId: 5,
				accountId: 1
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 3,
				testId: 5,
				accountId: 1
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 4,
				testId: 5,
				accountId: 1
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 5,
				testId: 5,
				accountId: 1
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 3,
				testId: 8,
				accountId: 3
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 2,
				testId: 8,
				accountId: 3
			}
		},
		{
			mark: 50,
			time: new MySQLDate(),
			lookups: {
				studentId: 1,
				testId: 8,
				accountId: 3
			}
		},
	]
};

module.exports = {
	data: data,
	details: details
};
