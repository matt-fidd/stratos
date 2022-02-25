'use strict';

/**
 * A class that represents the date of a test
 */
class TestDate extends Date {
	/**
	 * Overwrite the default string casting implementation to format
	 * all dates in the British format
	 *
	 * @returns {string} The formatted date
	 */
	toString() {
		return this.toLocaleDateString('en-GB');
	}
}

class Test {
	testId;
	testTemplateId;
	classId;
	testDate;

	constructor () {

	}

	get class() {

	}

	get students() {

	}

	get testTemplate() {

	}

	calculateAverageScore() {

	}

	calculateGradeBoundaries() {

	}
}

module.exports = Test;
