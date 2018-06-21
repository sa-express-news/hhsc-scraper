#! /usr/bin/env node
import * as _ from 'lodash';

// interfaces
import { 
	ParsedArguments,
	IDRange,
	OperationHash,
} from './interfaces';

// modules
import parseArguments 			from './parseArguments';
import getIDRange 				from './getIDRange';
import batchAndManageRequests	from './batchAndManageRequests';

// Number of IDs to try and pluck with each scrape
const range: number = 1;

// The amount of requests to make simultaneously
const throttle: number = 5;

const handleError = (err: any) => {
	console.error(err);
	return [];
}

const runScraper = async () => {
	const parsedArguments: ParsedArguments = parseArguments(process.argv.slice(2));

	if (parsedArguments.isSuccessful) {
		const { start, finish }: IDRange = getIDRange(parsedArguments.payload, range);
		const operations: Array<OperationHash> = await batchAndManageRequests(_.range(start, finish), throttle).catch(handleError);
		//console.log(operations);
	} else {
		console.error('One or more of the arguments passed to the scraper was invalid, please check the Readme for format deatils: https://github.com/sa-express-news/census-gopher#readme');
	}
}
runScraper();
