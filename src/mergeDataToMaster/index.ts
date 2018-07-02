// interfaces
import { OperationHash, AttemptedIDHandlerInstance } from '../interfaces';

export const removeDuplicates = (operations: Array<OperationHash>) => operations.filter(function ({
	operation_id,
	activity_date,
	standard_number_description,
	corrected_date,
	narrative,
}: OperationHash, key: number) {
	const uniqID = operation_id + activity_date + standard_number_description + corrected_date + narrative;
	return !this.has(uniqID) && this.add(uniqID);
}, new Set());

export default (operations: Array<OperationHash>, existingData: Array<OperationHash>, attemptedIDsHandler: AttemptedIDHandlerInstance) => {
	const master = removeDuplicates(existingData.concat(operations));
	// Update the totals tallys in attemptedIDs
	attemptedIDsHandler.setScrapeTotal(operations.length);
	attemptedIDsHandler.setDBTotal(master.length);
	return master;
}