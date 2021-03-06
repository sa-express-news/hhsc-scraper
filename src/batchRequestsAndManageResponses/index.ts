// interfaces
import { 
    OperationHash,
    AttemptedIDs,
    AttemptedIDHandlerInstance
}                               from '../interfaces';
import { Browser }              from 'puppeteer';
import { Logger }               from 'winston';

// modules
import scrapeOperation from '../scrapeOperation';

export const flattenArray = (batch: Array<Array<OperationHash>>) => ([] as Array<OperationHash>).concat(...batch);

export const removeEmpties = (batch: Array<Array<OperationHash>>) => batch.filter((operations: Array<OperationHash>) => operations.length > 0);

// creates and array the length of the batch throttle where each value is an ID that gets passed to scrapeOperations
export const getOperations = (
	range: Array<number>,
	pointer: number,
	throttle: number,
	browser: Browser,
	attemptedIDsHandler: AttemptedIDHandlerInstance,
	logger: Logger
) => range.slice(pointer, pointer + throttle).map(
	(id: number) => scrapeOperation(id, browser, attemptedIDsHandler, logger)
);

const handleError = (err: any, logger: Logger) => {
	logger.error(err)
	return [];
};

// For each ID, go out get the deficiencies and facility, then filter out the bad responses and flatten
export const updateCurrent = (
	range: Array<number>,
	pointer: number,
	throttle: number,
	browser: Browser,
	attemptedIDsHandler: AttemptedIDHandlerInstance,
	logger: Logger
) => {
	return Promise.all(
		getOperations(range, pointer, throttle, browser, attemptedIDsHandler, logger)
	).then(removeEmpties).then(flattenArray);
};

export default async (range: Array<number>, throttle: number, browser: Browser, attemptedIDsHandler: AttemptedIDHandlerInstance, logger: Logger) => {
	let pointer: number = 0;
	let current: Array<OperationHash>;
	let operations: Array<OperationHash> = [];

	// the while loop is used to batch requests to the HHSC server
	while (pointer < range.length) {
	    logger.info(`Next range: ${range[pointer]} to ${range[pointer] + throttle}`);
	    current = await updateCurrent(range, pointer, throttle, browser, attemptedIDsHandler, logger).catch((err) => handleError(err, logger));
	    logger.info(`Finished ${range[pointer]} to ${range[pointer] + throttle} with ${current.length} responses`);

	    operations = operations.concat(current);
	    pointer += throttle;
	}
	
	return operations;
}