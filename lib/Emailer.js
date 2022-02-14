'use strict';

function removeDupes(src, dest) {
	return src.filter(item => !dest.includes(item));
}

class EmailBuilder {
	subject;
	body;
	HTMLBody;
	from = 'Stratos <contact@stratos.com>';
	to;
	cc;
	bcc;

	constructor() {
		this.to = [];
		this.cc = [];
		this.bcc = [];
	}

	setSubject(subject) {
		this.subject = subject;
		return this;
	}

	setBody(body) {
		this.body = body;
		return this;
	}

	setHTMLBody(HTMLBody) {
		this.HTMLBody = HTMLBody;
		return this;
	}

	setFrom(from) {
		this.from = from;
		return this;
	}

	addTo(addresses) {
		const newAddresses = removeDupes(addresses, this.to);
		this.to.push(...newAddresses);
		return this;
	}

	removeTo(addresses) {
		this.to = removeDupes(this.to, addresses);
		return this;
	}

	addCC(addresses) {
		const newAddresses = removeDupes(addresses, this.to);
		this.cc.push(...newAddresses);
		return this;
	}

	removeCC(addresses) {
		this.cc = removeDupes(this.cc, addresses);
		return this;
	}

	addBCC(addresses) {
		const newAddresses = removeDupes(addresses, this.to);
		this.bcc.push(...newAddresses);
		return this;
	}

	removeBCC(addresses) {
		this.bcc = removeDupes(this.bcc, addresses);
		return this;
	}
}

module.exports = {
	EmailBuilder: EmailBuilder
};
