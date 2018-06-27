#! /usr/bin/env node
import * as _ from 'lodash';
import * as puppeteer from 'puppeteer';

// interfaces
import { 
	ParsedArguments,
	AttemptedIDs,
	IDRange,
	OperationHash,
} from './interfaces';
import { Browser } from 'puppeteer';

// modules
import parseArguments 					from './parseArguments';
import pullFromServer					from './pullFromServer';
import getIDRange 						from './getIDRange';
import batchRequestsAndManageResponses	from './batchRequestsAndManageResponses';

// Number of IDs to try and pluck with each scrape
const defaultScope: number = 1000;

// The amount of requests to make simultaneously
const defaultThrottle: number = 10;

const handleError = (err: any) => {
	console.error(err);
	return [];
}

const runScraper = async () => {
	// if the bash script contained start and end numbers, pluck them
	const parsedArguments: ParsedArguments 		= parseArguments(process.argv.slice(2));
	const existingData: Array<OperationHash> 	= await pullFromServer.getOperations().catch(() => null);
	const attemptedIDs: AttemptedIDs			= await pullFromServer.getAttemptedIDs().catch(() => null);

	if (parsedArguments.isSuccessful && existingData && attemptedIDs) {
		// Fire up a headless browser
		const browser: Browser = await puppeteer.launch();
		// grab the range of IDs we're seeking to retrieve and the batch retrieval rate
		const { range, throttle }: IDRange = getIDRange(parsedArguments.payload, attemptedIDs, defaultScope, defaultThrottle);
		// In case this whole thing goes up in flames
		const existingDataBackup: Array<OperationHash> = existingData;
		// this is the meat and potatoes command
		const operations: Array<OperationHash> = await batchRequestsAndManageResponses(range, throttle, browser).catch(handleError);
		//console.log(operations);
	} else {
		console.error('Pull from API failed or one or more of the arguments passed to the scraper was invalid, please check the Readme for format deatils: https://github.com/sa-express-news/census-gopher#readme');
	}
}
runScraper();
