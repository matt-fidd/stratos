'use strict';

const importJSON = require('./importJSON');

/**
 * removeDupes() Removes item from src array that appear in dest
 *
 * @param {Array} src - The source array to remove duplicates from
 * @param {Array} dest - The array to check against
 *
 * @return {Array} - The filtered array
 */
function removeDupes(src, dest) {
	return src.filter(item => !dest.includes(item));
}

/**
 * A class to allow for easy construction of emails
 */
class EmailBuilder {
	/**
	 * The subject of the email
	 * @type {string}
	 */
	subject;

	/**
	 * The plaintext body of the email
	 * @type {string}
	 */
	body;

	/**
	 * The html body of the email
	 * @type {string}
	 */
	HTMLBody;

	/**
	 * The from address for the email
	 * @type {string}
	 */
	from = 'Stratos <contact@stratos.com>';

	/**
	 * The addresses to send to
	 * @type {Array<string>}
	 */
	to;

	/**
	 * The addresses to carbon copy to
	 * @type {Array<string>}
	 */
	cc;

	/**
	 * The addresses to blind carbon copy to
	 * @type {Array<string>}
	 */
	bcc;

	constructor() {
		this.to = [];
		this.cc = [];
		this.bcc = [];
	}

	/**
	 * Sets the subject of the email
	 * @param {string} subject - The subject to set
	 * @returns {EmailBuilder}
	 */
	setSubject(subject) {
		this.subject = subject;
		return this;
	}

	/**
	 * Sets the plaintext body of the email
	 * @param {string} body - The body to set
	 * @returns {EmailBuilder}
	 */
	setBody(body) {
		this.body = body;
		return this;
	}

	/**
	 * Sets the HTML body of the email
	 * @param {string} HTMLBody - The body to set
	 * @returns {EmailBuilder}
	 */
	setHTMLBody(HTMLBody) {
		this.HTMLBody = HTMLBody;
		return this;
	}

	/**
	 * Sets the from address of the email
	 * @param {string} from - The address to set
	 * @returns {EmailBuilder}
	 */
	setFrom(from) {
		this.from = from;
		return this;
	}

	/**
	 * Adds a list of addresses to the 'to' addresses
	 * @param {Array<string>} addresses - The addresses to add
	 * @returns {EmailBuilder}
	 */
	addTo(addresses) {
		const newAddresses = removeDupes(addresses, this.to);
		this.to.push(...newAddresses);
		return this;
	}

	/**
	 * Removes a list of addresses from the 'to' addresses
	 * @param {Array<string>} addresses - The addresses to remove
	 * @returns {EmailBuilder}
	 */
	removeTo(addresses) {
		this.to = removeDupes(this.to, addresses);
		return this;
	}

	/**
	 * Adds a list of addresses to the 'cc' addresses
	 * @param {Array<string>} addresses - The addresses to add
	 * @returns {EmailBuilder}
	 */
	addCC(addresses) {
		const newAddresses = removeDupes(addresses, this.to);
		this.cc.push(...newAddresses);
		return this;
	}

	/**
	 * Removes a list of addresses from the 'cc' addresses
	 * @param {Array<string>} addresses - The addresses to remove
	 * @returns {EmailBuilder}
	 */
	removeCC(addresses) {
		this.cc = removeDupes(this.cc, addresses);
		return this;
	}

	/**
	 * Adds a list of addresses to the 'bcc' addresses
	 * @param {Array<string>} addresses - The addresses to add
	 * @returns {EmailBuilder}
	 */
	addBCC(addresses) {
		const newAddresses = removeDupes(addresses, this.to);
		this.bcc.push(...newAddresses);
		return this;
	}

	/**
	 * Removes a list of addresses from the 'bcc' addresses
	 * @param {Array<string>} addresses - The addresses to remove
	 * @returns {EmailBuilder}
	 */
	removeBCC(addresses) {
		this.bcc = removeDupes(this.bcc, addresses);
		return this;
	}
}

/**
 * Allows for email sending
 */
class Emailer {
	/**
	 * The host address for the SMTP server to send from
	 * @type {string}
	 */
	#host;

	/**
	 * The username to autheniticate against the SMTP server with
	 * @type {string}
	 */
	#user;

	/**
	 * The password to autheniticate against the SMTP server with
	 * @type {string}
	 */
	#password;

	/**
	 * Whether to use an encrypted connection or not
	 * @type {boolean}
	 */
	#secure = true;

	/**
	 * @param {Object} [connectionOpts] - The SMTP connection details
	 * @param {string} connectionOpts.host - The host address of the server
	 * @param {string} connectionOpts.user - The SMTP user
	 * @param {string} connectionOpts.password - The SMTP password
	 */
	constructor(connectionOpts) {
		if (typeof connectionOpts === 'undefined')
			connectionOpts = importJSON('email');

		this.#host = connectionOpts.host;
		this.#user = connectionOpts.user;
		this.#password = connectionOpts.password;
	}

	/**
	 * sendEmail() Send an EmailBuilder object as an email
	 *
	 * @param {EmailBuilder} email - The email object to send
	 *
	 * @return {boolean}
	 */
	async sendEmail(email) {
		console.log(`Sending`);
		console.log(email);
		console.log(this.#host,
			this.#user,
			this.#password,
			this.#secure);
	}

	/**
	 * Sets if the SMTP connection should be encrypted or not
	 * @param {boolean} val - The new value
	 */
	set secure(val) {
		if (typeof val !== 'boolean')
			throw new Error('Secure must be type boolean');

		this.#secure = val;
	}
}

module.exports = {
	EmailBuilder: EmailBuilder,
	Emailer: Emailer
};
