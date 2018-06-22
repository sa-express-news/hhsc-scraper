// interfaces
import { OperationHash } from '../interfaces';

// modules
import scrapeOperation	from '../scrapeOperation';

export const flattenArray = (batch: Array<Array<OperationHash>>) => ([] as Array<OperationHash>).concat(...batch);

export const removeEmpties = (batch: Array<Array<OperationHash>>) => batch.filter((operations: Array<OperationHash>) => operations.length > 0);

// creates and array the length of the batch throttle where each value is an ID that gets passed to scrapeOperations
export const getOperations = (range: Array<number>, pointer: number, throttle: number) => range.slice(pointer, pointer + throttle).map(scrapeOperation);

const handleError = (err: any) => {
	console.error(err);
	return [];
};

// For each ID, go out get the deficiencies and facility, then filter out the bad responses and flatten
export const updateCurrent = (range: Array<number>, pointer: number, throttle: number) => {
	return Promise.all(getOperations(range, pointer, throttle)).then(removeEmpties).then(flattenArray);
};

export default async (range: Array<number>, throttle: number) => {
	let pointer: number = 0;
	let current: Array<OperationHash>;
	let result: Array<OperationHash> = [];
	// the while loop is used to batch requests to the HHSC server
	while (pointer < range.length) {
		current = await updateCurrent(range, pointer, throttle).catch(handleError);
		result = result.concat(current);
		pointer += throttle;
	}
	return result;
}