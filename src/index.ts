#! /usr/bin/env node
import * as _ from 'lodash';
import * as puppeteer from 'puppeteer';

// interfaces
import { 
	ParsedArguments,
	AttemptedIDs,
	IDRange,
	OperationHash,
	ScrapeResult,
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

const handleError = (err: any, attemptedIDs: AttemptedIDs) => {
	console.error(err);
	return {
		operations: [],
		attemptedIDs,
	};
}

const runScraper = async () => {
	// if the bash script contained start and end numbers, pluck them
	const parsedArguments: ParsedArguments 			= parseArguments(process.argv.slice(2));
	const existingData: Array<OperationHash> 		= await pullFromServer.getOperations().catch(() => null);
	const prevAttemptedIDs: AttemptedIDs			= await pullFromServer.getAttemptedIDs().catch(() => null);

	if (parsedArguments.isSuccessful && existingData && prevAttemptedIDs) {
		// Fire up a headless browser
		const browser: Browser = await puppeteer.launch();
		// grab the range of IDs we're seeking to retrieve and the batch retrieval rate
		const { range, throttle }: IDRange = getIDRange(parsedArguments.payload, prevAttemptedIDs, defaultScope, defaultThrottle);
		// In case this whole thing goes up in flames
		const existingDataBackup: Array<OperationHash> = existingData;
		// this is the meat and potatoes command
		const { operations, attemptedIDs }: ScrapeResult = await batchRequestsAndManageResponses(range, throttle, browser, prevAttemptedIDs).catch((err: any) => handleError(err, prevAttemptedIDs));
		//console.log(operations);
	} else {
		console.error('Pull from API failed or one or more of the arguments passed to the scraper was invalid, please check the Readme for format deatils: https://github.com/sa-express-news/census-gopher#readme');
	}
}
runScraper();
