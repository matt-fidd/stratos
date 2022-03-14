'use strict';

const helpers = {};

helpers.eq = function (arg1, arg2, options) {
	return arg1 === arg2 ? options.fn(this) : options.inverse(this);
};

helpers.json = function (object) {
	return JSON.stringify(object);
};

module.exports = helpers;
