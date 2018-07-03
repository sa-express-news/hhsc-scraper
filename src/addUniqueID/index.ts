// interfaces
import { OperationHash, UniqOperationHash } from '../interfaces';

// find the highest previously assigned unique ID
export const getLastID = (existingData: Array<UniqOperationHash>) => existingData.reduce((high: number, { uniq_id }: UniqOperationHash) => {
	return uniq_id > high ? uniq_id : high;
}, 0);

// building atop the highest previously assigned unique ID, add new IDs to the newly scraped operations
export const addIDs = (operations: Array<OperationHash>, last: number) => operations.map((operation: OperationHash, idx: number) => {
	return Object.assign({}, { uniq_id: last + idx + 1 }, operation);
});

export default (operations: Array<OperationHash>, existingData: Array<UniqOperationHash>) => {
	const last = getLastID(existingData);
	return addIDs(operations, last);
};