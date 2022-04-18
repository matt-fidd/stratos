'use strict';

const helpers = {};

helpers.eq = function (arg1, arg2, options) {
	return arg1 === arg2 ? options.fn(this) : options.inverse(this);
};

helpers.json = function (object) {
	return JSON.stringify(object);
};

helpers.formatTime = function (date) {
	const dateOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	};

	const timeOptions = {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit'
	};

	return (
		date.toLocaleDateString('en', dateOptions) +
		' ' +
		date.toLocaleTimeString('en', timeOptions)
	);
};

module.exports = helpers;
