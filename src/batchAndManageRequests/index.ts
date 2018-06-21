// interfaces
import { OperationHash } from '../interfaces';

// modules
import scrapeOperation	from '../scrapeOperation';

export const flattenArray = (batch: Array<Array<OperationHash>>) => ([] as Array<OperationHash>).concat(...batch);

export const removeEmpties = (operations: Array<OperationHash>) => operations.length > 0;

export const getOperations = (range: Array<number>, pointer: number, throttle: number) => range.slice(pointer, pointer + throttle).map(scrapeOperation);

const handleError = (err: any) => {
	console.error(err);
	return [];
};

export const updateCurrent = (range: Array<number>, pointer: number, throttle: number) => {
	return Promise.all(getOperations(range, pointer, throttle)).then((batch: Array<Array<OperationHash>>) => batch.filter(removeEmpties)).then(flattenArray);
};

export default async (range: Array<number>, throttle: number) => {
	let pointer: number = 0;
	let current: Array<OperationHash>;
	let result: Array<OperationHash> = [];
	while (pointer < range.length) {
		current = await updateCurrent(range, pointer, throttle).catch(handleError);
		result = result.concat(current);
		pointer += throttle;
	}
	return result;
}