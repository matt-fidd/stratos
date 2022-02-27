'use strict';

// Class for easy insertion of test dates into the database
class MySQLDate extends Date {
	toString() {
		return this.toISOString().slice(0, 19).replace('T', ' ');
	}

	alterDays(amount) {
		this.setDate(this.getDate() + amount);
		return this;
	}
}

module.exports = MySQLDate;
