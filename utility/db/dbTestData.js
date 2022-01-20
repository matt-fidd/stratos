'use strict';

// Import required modules
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');

// Import user defined modules
const DatabaseConnectionPool =
	require(path.join(__dirname, '../../lib/DatabaseConnectionPool'));

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
			otherNames: '',
			lastName: 'Jonas',
			password: 'p2'
		},
		{
			email: 'p3@stratos.com',
			firstName: 'Mohammad',
			otherNames: '',
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
			otherNames: '',
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
			otherNames: '',
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
			otherNames: '',
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
			otherNames: '',
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
			otherNames: '',
			lastName: 'Vaughn',
			password: 'a3'
		},
	]
};

// Object to store the relationships between tables to be inserted into
// link tables
const relationships = {
	studentParentLink: [
		{
			studentId: 1,
			parentId: 1
		},
		{
			studentId: 2,
			parentId: 2
		},
		{
			studentId: 2,
			parentId: 3
		},
		{
			studentId: 3,
			parentId: 4
		},
		{
			studentId: 4,
			parentId: 4
		},
		{
			studentId: 4,
			parentId: 5
		},
		{
			studentId: 5,
			parentId: 5
		}
	],
	studentClassLink: [
		{
			studentId: 1,
			classId: 1
		},
		{
			studentId: 2,
			classId: 1
		},
		{
			studentId: 3,
			classId: 1
		},
		{
			studentId: 4,
			classId: 1
		},
		{
			studentId: 5,
			classId: 1
		},
		{
			studentId: 1,
			classId: 2
		},
		{
			studentId: 2,
			classId: 2
		},
		{
			studentId: 1,
			classId: 3
		},
		{
			studentId: 2,
			classId: 3
		},
		{
			studentId: 3,
			classId: 3
		},
		{
			studentId: 4,
			classId: 4
		},
		{
			studentId: 5,
			classId: 4
		},
	],
	accountClassLink: [
		{
			accountId: 1,
			classId: 1,
		},
		{
			accountId: 1,
			classId: 2,
		},
		{
			accountId: 2,
			classId: 2,
		},
		{
			accountId: 3,
			classId: 3,
		},
		{
			accountId: 1,
			classId: 4,
		},
		{
			accountId: 2,
			classId: 4,
		},
		{
			accountId: 3,
			classId: 4,
		},
	]
};

async function cleanDb(dbConnectionPool) {
	/*
		Cleans the database of any existing records that will
		conflict with the test data

		Arguments:
			- database connection object
	*/

	// List of table names to be cleared
	const deletionList = [
		'studentParentLink',
		'studentClassLink',
		'accountClassLink',
		'class',
		'subject',
		'parent',
		'student',
		'account'
	];

	for (const table of deletionList)
		await dbConnectionPool.runQuery(`DELETE FROM ${table};`);
}

/**
 * insertData() Inserts test data into a database
 *
 * @param {object} [dbOptions]
 * 	- An object in the form found in config/db.json supplying the db to
 * 	connect to
 *
 * @return {void}
 */
async function insertData(dbOptions) {
	const dbConnectionPool = await new DatabaseConnectionPool(dbOptions);

	await cleanDb(dbConnectionPool);

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

			data[table][counter] = dataToInsert;

			const qs = '?, '.repeat(Object.keys(
				dataToInsert).length).slice(0, -2);

			const sql = `INSERT INTO ${table} ` +
				`(${Object.keys(dataToInsert)})` +
				` VALUES ` +
				`(${qs});`;

			console.log(sql);

			try {
				await dbConnectionPool.runQuery(sql,
					Object.values(dataToInsert));
			} catch (e) {
				console.error(e);
			}

			counter++;
		}
	}

	console.log('\n');

	// Iterate over all of the link tables in the relationship object
	for (const tableName of Object.keys(relationships)) {
		// Array containing all of the relationships for the table
		const table = relationships[tableName];

		// Iterate over the relationships
		for (const relationship of table) {
			// Object that will contain a record to insert
			const dataToInsert = {};

			// Iterate over the individual relationships
			// to easily parse them into records to insert
			for (const [ k, v ] of Object.entries(relationship)) {
				// The name of the table to lookup the given
				// ID in
				const resolveTable = k.split('Id')[0];

				// Array containing the enumerated records
				// from the data object relating to the lookup
				// table
				const d =
					Object.values(data[resolveTable])[v-1];

				// Add the id of the record that needs to be
				// linked, to the record object
				dataToInsert[k] = d[k];
			}

			const qs = '?, '.repeat(Object.keys(
				dataToInsert).length).slice(0, -2);

			const sql = `INSERT INTO ${tableName} ` +
				`(${Object.keys(dataToInsert)}) ` +
				`VALUES ` +
				`(${qs});`;

			console.log(sql);

			try {
				await dbConnectionPool.runQuery(sql,
					Object.values(dataToInsert));
			} catch (e) {
				console.error(e);
			}
		}
	}

	await dbConnectionPool.close();
}

insertData();
