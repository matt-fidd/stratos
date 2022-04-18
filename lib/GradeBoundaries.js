'use strict';

class GradeBoundaries {
	boundaries;

	constructor(boundaries = {
		'A*': 90,
		'A': 80,
		'B': 70,
		'C': 60,
		'D': 50,
		'E': 40,
		'F': 0
	}) {
		this.boundaries = boundaries;
	}

	getGrade(score) {
		const boundaries = Object.values(this.boundaries);

		for (const [ i, number ] of boundaries.entries()) {
			if (score >= number)
				return Object.entries(this.boundaries)[i][0];
		}
	}

	toString() {
		return Object.entries(this.boundaries).reduce((res, b) => {
			return `${res}\n${b[0]}${' '.repeat(2 - b[0].length)}` +
				`: >= ${b[1]}`;
		}, '');
	}
}

module.exports = GradeBoundaries;
