// interfaces
import { OperationHash } 	from '../interfaces';
import { Browser } 			from 'puppeteer';

// modules
import scrapeOperation	from '../scrapeOperation';

export const flattenArray = (batch: Array<Array<OperationHash>>) => ([] as Array<OperationHash>).concat(...batch);

export const removeEmpties = (batch: Array<Array<OperationHash>>) => batch.filter((operations: Array<OperationHash>) => operations.length > 0);

// creates and array the length of the batch throttle where each value is an ID that gets passed to scrapeOperations
export const getOperations = (range: Array<number>, pointer: number, throttle: number, browser: Browser) => range.slice(pointer, pointer + throttle).map((id: number) => scrapeOperation(id, browser));

const handleError = (err: any) => {
	console.error(err);
	return [];
};

// For each ID, go out get the deficiencies and facility, then filter out the bad responses and flatten
export const updateCurrent = (range: Array<number>, pointer: number, throttle: number, browser: Browser) => {
	return Promise.all(getOperations(range, pointer, throttle, browser)).then(removeEmpties).then(flattenArray);
};

export default async (range: Array<number>, throttle: number, browser: Browser) => {
	let pointer: number = 0;
	let current: Array<OperationHash>;
	let result: Array<OperationHash> = [];
	// the while loop is used to batch requests to the HHSC server
	while (pointer < range.length) {
		console.log('trying ' + range[pointer]);
		current = await updateCurrent(range, pointer, throttle, browser).catch(handleError);
		console.log('Finished ' + range[pointer] + ' with ' + current.length + ' responses');
		result = result.concat(current);
		pointer += throttle;
	}
	return result;
}