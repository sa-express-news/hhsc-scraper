import * as _ from 'lodash';

// interfaces
import { UniqOperationHash, AttemptedIDHandlerInstance } from '../interfaces';

// we're handling to possible error situations here. 
// 1. The scraped deficency already exists in DB 
// 2. Due to HHSC site bugs, very occassionally a defiency row can be scraped twice. If this happens, we need to remove those duplicates
// removeDuplicates creates a Set which we use to store and identify existing hashes. Array.filter is then used to discard dups.
export const removeDuplicates = (operations: Array<UniqOperationHash>) => operations.filter(function (operation: UniqOperationHash) {
	const uniqID = Object.values(_.omit(operation, 'uniq_id')).join(' ');
	return !this.has(uniqID) && this.add(uniqID);
}, new Set());

export default (operations: Array<UniqOperationHash>, existingData: Array<UniqOperationHash>, attemptedIDsHandler: AttemptedIDHandlerInstance) => {
	const master = removeDuplicates(existingData.concat(operations));
	// Update the totals tallys in attemptedIDs
	attemptedIDsHandler.setScrapeTotal(operations.length);
	attemptedIDsHandler.setDBTotal(master.length);
	return master;
}