'use strict';

// Import required modules
const express = require('express');

// Import user defined modules
const importJSON = require('./lib/importJSON');

async function main() {
	// Import server config file
	const serverOptions = importJSON('server');

	// Initialise up express app
	const app = express();

	// Start the server
	app.listen(serverOptions.port, () => {
		console.log(`Server listening on :${serverOptions.port}`);
	});
}

main().catch(console.error);
