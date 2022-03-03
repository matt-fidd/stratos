/* eslint-disable no-await-in-loop */
'use strict';

// Import required modules
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const path = require('path');

// Import user defined modules
const DatabaseConnectionPool =
	require(path.join(__dirname, '../../lib/DatabaseConnectionPool'));

// Import test data object
const { data, details } = require('./testData');

/**
 * insertData() Inserts test data into a database
 *
 * @return {void}
 */
async function insertTestData() {
	const conn = await new DatabaseConnectionPool();

	// Run the creation statment for each table
	for (const table of Object.keys(data)) {
		let counter = 0;

		for (const record of data[table]) {
			const dataToInsert = { ...record };

			if (details?.[table]?.id === 'uuid') {
				dataToInsert[`${table}Id`] =
					crypto.randomUUID();
			} else {
				dataToInsert[`${table}Id`] = counter + 1;
			}

			if (details?.[table]?.hashPassword) {
				dataToInsert.password =
					await bcrypt.hash(
						dataToInsert.password,
						10);
			}

			if (details?.[table]?.link)
				delete dataToInsert[`${table}Id`];

			if (record?.lookups) {
				delete dataToInsert.lookups;
				const lookupsEntries =
					Object.entries(record.lookups);

				for (const [ key, index ] of lookupsEntries) {
					const resolveTable = key.split('Id')[0];
					const r = data[resolveTable][index - 1];

					dataToInsert[key] = r[key];
				}
			}

			data[table][counter] = dataToInsert;

			const qs = '?, '.repeat(Object.keys(
				dataToInsert).length).slice(0, -2);

			const sql = `
				insert into ${table} ` +
				`(${Object.keys(dataToInsert)})` +
				' values ' +
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

module.exports = insertTestData;
