'use strict';

// Import required modules
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');

// Import user defined modules
const DatabaseConnectionPool =
	require(path.join(__dirname, '../../lib/DatabaseConnectionPool'));

// Class for easy insertion of test dates into the database
class mySQLDate extends Date {
	toString() {
		return this.toISOString().slice(0, 19).replace('T', ' ');
	}

	alterDays(amount) {
		this.setDate(this.getDate() + amount);
		return this;
	}
}

// Object storing configurations for the db tables
const tableDetails = {
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
			testDate: new mySQLDate(),
			lookups: {
				classId: 1,
				testTemplateId: 1
			}
		},
		{
			testDate: new mySQLDate().alterDays(1),
			lookups: {
				classId: 2,
				testTemplateId: 1
			}
		},
		{
			testDate: new mySQLDate().alterDays(30),
			lookups: {
				classId: 4,
				testTemplateId: 1
			}
		},
		{
			testDate: new mySQLDate().alterDays(-10),
			lookups: {
				classId: 1,
				testTemplateId: 4
			}
		},
		{
			testDate: new mySQLDate().alterDays(-100),
			lookups: {
				classId: 1,
				testTemplateId: 2
			}
		},
		{
			testDate: new mySQLDate().alterDays(50),
			lookups: {
				classId: 4,
				testTemplateId: 2
			}
		},
		{
			testDate: new mySQLDate().alterDays(10),
			lookups: {
				classId: 4,
				testTemplateId: 3
			}
		},
		{
			testDate: new mySQLDate().alterDays(-15),
			lookups: {
				classId: 3,
				testTemplateId: 3
			}
		},
		{
			testDate: new mySQLDate().alterDays(-108),
			lookups: {
				classId: 3,
				testTemplateId: 3
			}
		},
		{
			testDate: new mySQLDate().alterDays(-4),
			lookups: {
				classId: 2,
				testTemplateId: 4
			}
		},
		{
			testDate: new mySQLDate().alterDays(-8),
			lookups: {
				classId: 3,
				testTemplateId: 4
			}
		},
		{
			testDate: new mySQLDate().alterDays(1),
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
	]
};

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

/**
 * insertData() Inserts test data into a database
 *
 * @return {void}
 */
async function insertData() {
	const conn = await new DatabaseConnectionPool();

	// Run the creation statment for each table
	for (const table of Object.keys(data)) {
		let counter = 0;

		for (const record of data[table]) {
			const dataToInsert = { ...record };

			if (tableDetails?.[table]?.['id'] === 'uuid') {
				dataToInsert[`${table}Id`] =
					crypto.randomUUID();
			} else {
				dataToInsert[`${table}Id`] = counter + 1;
			}

			if (tableDetails?.[table]?.['hashPassword']) {
				dataToInsert['password'] =
					await bcrypt.hash(
						dataToInsert['password'],
						10);
			}

			if (tableDetails?.[table]?.['link'])
				delete dataToInsert[`${table}Id`];

			if (record?.lookups) {
				delete dataToInsert.lookups;

				for (let [ key, index ] of
					Object.entries(record.lookups)) {

					const resolveTable = key.split('Id')[0];
					index--;

					dataToInsert[key] =
						data[resolveTable][index][key];
				}
			}

			data[table][counter] = dataToInsert;

			const qs = '?, '.repeat(Object.keys(
				dataToInsert).length).slice(0, -2);

			const sql = `
				insert into ${table} ` +
				`(${Object.keys(dataToInsert)})` +
				` values ` +
				`(${qs});`;

			console.log(sql.trim());

			try {
				await conn.runQuery(sql,
					Object.values(dataToInsert));
			} catch (e) {
				console.error(e);
			}

			counter++;
		}
	}

	conn.close();
}

module.exports = {
	insert: insertData,
	clean: cleanDb
};
