'use strict';

// Import required modules
const path = require('path');

// Import user defined modules
const DatabaseConnectionPool =
	require(path.join(__dirname, '../../lib/DatabaseConnectionPool'));

// Initialise maps for table creation and constraint queries
const tableCreate = new Map();
const tableConstraints = new Map();

// For each table, set tableCreate.tableName equal to the creation statment
tableCreate.set('account', `
	CREATE TABLE IF NOT EXISTS account (
		accountId            varchar(36)  NOT NULL    PRIMARY KEY,
		email                varchar(255)  NOT NULL    ,
		firstName            varchar(50)  NOT NULL    ,
		otherNames           varchar(255) ,
		lastName             varchar(50)  NOT NULL    ,
		password             varchar(60)  NOT NULL    ,
		CONSTRAINT Unq_account_email UNIQUE ( email )
	 );
`);

tableCreate.set('parent', `
	CREATE TABLE IF NOT EXISTS parent (
		parentId             varchar(36)  NOT NULL    PRIMARY KEY,
		email                varchar(255)  NOT NULL    ,
		firstName            varchar(50)  NOT NULL    ,
		otherNames           varchar(50) ,
		lastName             varchar(50)  NOT NULL    ,
		password             varchar(60)  NOT NULL    ,
		CONSTRAINT Unq_parent UNIQUE ( email )
	);
`);

tableCreate.set('student', `
	CREATE TABLE IF NOT EXISTS student (
		studentId            varchar(36)  NOT NULL    PRIMARY KEY,
		email                varchar(255)  NOT NULL    ,
		firstName            varchar(50)  NOT NULL    ,
		otherNames           varchar(50) ,
		lastName             varchar(50)  NOT NULL    ,
		password             varchar(60)  NOT NULL    ,
		CONSTRAINT Unq_student UNIQUE ( email )
	);
`);

tableCreate.set('studentParentLink', `
	CREATE TABLE IF NOT EXISTS studentParentLink (
		studentid            varchar(36)  NOT NULL    ,
		parentId             varchar(36)  NOT NULL    ,
		CONSTRAINT pk_studentparentlink_studentid
			PRIMARY KEY ( studentid, parentId )
	);
`);

tableCreate.set('subject', `
	CREATE TABLE IF NOT EXISTS subject (
		subjectId            int  NOT NULL  AUTO_INCREMENT  PRIMARY KEY,
		name                 varchar(100)  NOT NULL
	);
`);

tableCreate.set('testTemplate', `
	CREATE TABLE IF NOT EXISTS testTemplate (
		testTemplateId       varchar(36)  NOT NULL    PRIMARY KEY,
		accountId            varchar(36)  NOT NULL    ,
		name                 varchar(100)  NOT NULL    ,
		maxMark              int UNSIGNED  NOT NULL,
		gradeBoundaries      longtext
	);
`);

tableCreate.set('class', `
	CREATE TABLE IF NOT EXISTS class (
		classId              varchar(36)  NOT NULL    PRIMARY KEY,
		name                 varchar(50)  NOT NULL    ,
		subjectId            int  NOT NULL
	);
`);

tableCreate.set('passwordReset', `
	CREATE TABLE IF NOT EXISTS passwordReset (
		userId               varchar(36)  NOT NULL    PRIMARY KEY,
		token                varchar(60)  NOT NULL    ,
		nonce                varchar(16)  NOT NULL    ,
		expires              datetime  NOT NULL
	);
`);

tableCreate.set('studentClassLink', `
	CREATE TABLE IF NOT EXISTS studentClassLink (
		studentId            varchar(36)  NOT NULL    ,
		classId              varchar(36)  NOT NULL    ,
		CONSTRAINT Pk_studentClassLink_studentId
			PRIMARY KEY ( studentId, classId )
	);
`);

tableCreate.set('test', `
	CREATE TABLE IF NOT EXISTS test (
		testId               varchar(36)  NOT NULL    PRIMARY KEY,
		testTemplateId       varchar(36)  NOT NULL    ,
		classId              varchar(36)  NOT NULL    ,
		testDate             date  NOT NULL    ,
		CONSTRAINT Unq_test UNIQUE ( testTemplateId, classId, testDate )
	);
`);

tableCreate.set('testResult', `
	CREATE TABLE IF NOT EXISTS testResult (
		testResultId         varchar(36) NOT NULL     PRIMARY KEY,
		studentId            varchar(36)  NOT NULL    ,
		testId               varchar(36)  NOT NULL    ,
		accountId            varchar(36)  NOT NULL    ,
		mark                 int UNSIGNED  NOT NULL    ,
		time                 datetime NOT NULL        ,
		CONSTRAINT Unq_testResult UNIQUE ( studentId, testId )
	);
`);

tableCreate.set('accountClassLink', `
	CREATE TABLE IF NOT EXISTS accountClassLink (
		accountId            varchar(36)  NOT NULL    ,
		classId              varchar(36)  NOT NULL    ,
		CONSTRAINT primarykey PRIMARY KEY ( accountId, classId )
	);
`);

/*
 * For each table constraint, set tableConstraints.constraintName equal to the
 * creation statment for that constraint
 */
tableConstraints.set('accountClassLink_fk0', `
	ALTER TABLE accountClassLink
	ADD CONSTRAINT accountClassLink_fk0
	FOREIGN KEY IF NOT EXISTS ( accountId )
	REFERENCES account( accountId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('accountClassLink_fk1', `
	ALTER TABLE accountClassLink
	ADD CONSTRAINT accountClassLink_fk1
	FOREIGN KEY IF NOT EXISTS ( classId )
	REFERENCES class( classId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('class_fk0', `
	ALTER TABLE class
	ADD CONSTRAINT class_fk0
	FOREIGN KEY IF NOT EXISTS ( subjectId )
	REFERENCES subject( subjectId )
	ON DELETE RESTRICT
	ON UPDATE NO ACTION;
`);

tableConstraints.set('fk_studentclasslink_student', `
	ALTER TABLE studentClassLink
	ADD CONSTRAINT fk_studentclasslink_student
	FOREIGN KEY IF NOT EXISTS ( studentId )
	REFERENCES student( studentId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('fk_studentclasslink_class', `
	ALTER TABLE studentClassLink
	ADD CONSTRAINT fk_studentclasslink_class
	FOREIGN KEY IF NOT EXISTS ( classId )
	REFERENCES class( classId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('fk_studentclasslink_class', `
	ALTER TABLE studentParentLink
	ADD CONSTRAINT studentParentLink_fk0
	FOREIGN KEY IF NOT EXISTS ( studentid )
	REFERENCES student( studentId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('studentParentLink_fk1', `
	ALTER TABLE studentParentLink
	ADD CONSTRAINT studentParentLink_fk1
	FOREIGN KEY IF NOT EXISTS ( parentId )
	REFERENCES parent( parentId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('fk_test_account', `
	ALTER TABLE test
	ADD CONSTRAINT fk_test_account
	FOREIGN KEY IF NOT EXISTS ( classId )
	REFERENCES class( classId )
	ON DELETE RESTRICT
	ON UPDATE NO ACTION;
`);

tableConstraints.set('fk_test_testtemplate', `
	ALTER TABLE test
	ADD CONSTRAINT fk_test_testtemplate
	FOREIGN KEY IF NOT EXISTS ( testTemplateId )
	REFERENCES testTemplate( testTemplateId )
	ON DELETE NO ACTION
	ON UPDATE NO ACTION;
`);

tableConstraints.set('testResult_fk0', `
	ALTER TABLE testResult
	ADD CONSTRAINT testResult_fk0
	FOREIGN KEY IF NOT EXISTS ( studentId )
	REFERENCES student( studentId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('fk_testresult_test', `
	ALTER TABLE testResult
	ADD CONSTRAINT fk_testresult_test
	FOREIGN KEY IF NOT EXISTS ( testId )
	REFERENCES test( testId )
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
`);

tableConstraints.set('fk_testresult_account', `
	ALTER TABLE testResult
	ADD CONSTRAINT fk_testresult_account
	FOREIGN KEY IF NOT EXISTS ( accountId )
	REFERENCES account( accountId )
	ON DELETE NO ACTION
	ON UPDATE NO ACTION;
`);

tableConstraints.set('test_fk0', `
	ALTER TABLE testTemplate
	ADD CONSTRAINT test_fk0
	FOREIGN KEY IF NOT EXISTS ( accountId )
	REFERENCES account( accountId )
	ON DELETE NO ACTION
	ON UPDATE NO ACTION;
`);

/**
 * dbInit() Initialises a database and applies the stratos schema to it
 *
 * @return {void}
 */
async function dbInit() {
	const conn = await new DatabaseConnectionPool();

	// Run the creation statment for each table
	for (const [ tableName, sql ] of tableCreate) {
		console.log(`Creating table ${tableName}`);

		try {
			/* eslint-disable-next-line no-await-in-loop */
			await conn.runQuery(sql);
		} catch (e) {
			console.error(e);
			throw new Error(`Unable to create table ${tableName}`);
		}
	}

	console.log('\n');

	// Run the creation statment for each constraint
	for (const [ fkName, sql ] of tableConstraints) {
		console.log(`Creating constraint ${fkName}`);

		try {
			/* eslint-disable-next-line no-await-in-loop */
			await conn.runQuery(sql);
		} catch (e) {
			console.error(e);
			throw new Error('Unable to create constraint ' +
				`${fkName}`);
		}
	}

	await conn.close();
}

module.exports = dbInit;
