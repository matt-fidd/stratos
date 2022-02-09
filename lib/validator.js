'use strict';

/**
 * validEmail() Check that an email email matches a simple valid email regex
 *
 * @param {string} email - The email address to be validated
 * @param {RegExp} [emailRegex] - RegExp to use for validation
 *
 * @return {boolean} - If the email address is valid
 */
function validEmail(email, emailRegex) {
	if (typeof emailRegex === 'undefined')
		emailRegex = /\S+@\S+\.\S+/;

	return emailRegex.test(email);
}

/**
 * passwordsMatch() Check that two password fields match
 *
 * @param {string} password1 - The first password
 * @param {string} password2 - The second password
 *
 * @return {boolean} - If the passwords match
 */
function passwordsMatch(password1, password2) {
	if (typeof password1 !== 'string' || typeof password2 !== 'string')
		return false;

	return password1 === password2;
}

/**
 * validate() Main validation wrapper function to validate full POST form body
 *
 * @param {Object} body - The body of an express request
 * @param {Array<string>} fields - Fields to check
 * @param {Object} [validation] - Fields to run special validation against
 *
 * @return {Object} results
 * @return {Map<string, string>} results.fields - Sanitised and validated fields
 */
function validate(body, fields, validation = {}) {
	const fieldsMap = new Map();

	// Check all required fields are not empty, and sanitise them
	for (const field of fields) {
		const cleanField = body[field]?.trim() ?? false;

		if (cleanField === false || cleanField.length < 1)
			throw new Error(`${field} is missing`);

		fieldsMap.set(field, cleanField);
	}

	// Handle validation as required in options
	for (const [ check, checkOpts ] of Object.entries(validation)) {
		let valid;

		// Handlers for validation types go here
		switch (check) {
			case 'email':
				valid = validEmail(fieldsMap.get(checkOpts));
				break;
			case 'password':
				valid = passwordsMatch(
					fieldsMap.get(checkOpts[0]),
					fieldsMap.get(checkOpts[1])
				);
				break;
			default:
				throw new Error('Invalid validation type');
		}

		if (!valid)
			throw new Error(`Invalid ${check}`);
	}

	return {
		fields: fieldsMap
	};
}

module.exports = {
	validEmail: validEmail,
	passwordsMatch: passwordsMatch,
	validate: validate
};
