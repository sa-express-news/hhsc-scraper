#! /usr/bin/env node
import * as _ from 'lodash';
import * as puppeteer from 'puppeteer';

// interfaces
import { 
	ParsedArguments,
	AttemptedIDs,
	IDRange,
	AttemptedIDHandlerInstance,
	OperationHash,
	ScrapeResult
} 					from './interfaces';
import { Browser } 	from 'puppeteer';
import { Logger } 	from 'winston';

// modules
import createLogger						from './logger';
import parseArguments 					from './parseArguments';
import pullFromServer					from './pullFromServer';
import getIDRange 						from './getIDRange';
import AttemptedIDsHandler				from './AttemptedIDsHandler';
import batchRequestsAndManageResponses	from './batchRequestsAndManageResponses';
import mergeDataToMaster				from './mergeDataToMaster';
import pushToServer						from './pushToServer';

// Number of IDs to try and pluck with each scrape
const defaultScope: number = 1000;

// The amount of requests to make simultaneously
const defaultThrottle: number = 10;

const handleError = (err: any, attemptedIDs: AttemptedIDs, logger: Logger) => {
	logger.error(err);
	return {
		operations: [],
		attemptedIDs,
	};
}

const runScraper = async () => {
	// if the bash script contained start and end numbers, pluck them
	const logger: Logger 						= createLogger();
	const parsedArguments: ParsedArguments 		= parseArguments(process.argv.slice(2));
	const existingData: Array<OperationHash> 	= await pullFromServer.getOperations(logger).catch(() => null);
	const prevAttemptedIDs: AttemptedIDs		= await pullFromServer.getAttemptedIDs(logger).catch(() => null);

	if (parsedArguments.isSuccessful && existingData && prevAttemptedIDs) {
		// Fire up a headless browser
		const browser: Browser = await puppeteer.launch();
		// grab the range of IDs we're seeking to retrieve and the batch retrieval rate
		const { range, throttle }: IDRange = getIDRange(parsedArguments.payload, prevAttemptedIDs, defaultScope, defaultThrottle);
		// start logging attempted IDs
		const attemptedIDsHandler: AttemptedIDHandlerInstance = new AttemptedIDsHandler(prevAttemptedIDs, range);
		// this is the meat and potatoes command
		const { operations, attemptedIDs }: ScrapeResult = await batchRequestsAndManageResponses(range, throttle, browser, attemptedIDsHandler, logger).catch((err: any) => handleError(err, prevAttemptedIDs, logger));
		// add the new data tp the previously scraped data
		const master: Array<OperationHash> = mergeDataToMaster(operations, existingData, attemptedIDsHandler);
		// push the new data, the backup data and the attemptedIDs to the server
		await pushToServer(master, existingData, attemptedIDs, logger);
		await browser.close();
		logger.info('Successfully completed scrape!');
	} else {
		logger.error('Pull from API failed or one or more of the arguments passed to the scraper was invalid, please check the Readme for format deatils: https://github.com/sa-express-news/census-gopher#readme');
	}
}
runScraper();
