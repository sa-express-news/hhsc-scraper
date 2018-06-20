#! /usr/bin/env node
import _ from 'lodash';

// interfaces
import { 
	ParsedArguments,
	IDRange,
	OperationHash,
} from './interfaces';

// modules
import parseArguments 	from './parseArguments';
import getIDRange 		from './getIDRange';
import scrapeOperation	from './scrapeOperation';

// Number of IDs to try and pluck with each scrape
const range: number = 1000;

const runScraper = async () => {
	const parsedArguments: ParsedArguments = parseArguments(process.argv.slice(2));

	if (parsedArguments.isSuccessful) {
		const { start, finish }: IDRange = getIDRange(parsedArguments.payload, range);
		const operations: OperationHash = await Promise.all(_.range(start, finish).reduce(scrapeOperation, [])).catch((err: any) => console.error(err));
	} else {
		console.error('One or more of the arguments passed to the scraper was invalid, please check the Readme for format deatils: https://github.com/sa-express-news/census-gopher#readme');
	}
}
