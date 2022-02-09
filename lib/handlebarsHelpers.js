'use strict';

const helpers = {};

helpers.eq = (arg1, arg2, options) =>
	arg1 == arg2 ? options.fn(this) : options.inverse(this);

module.exports = helpers;
