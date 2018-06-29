import * as _ from 'lodash';

// interfaces
import { OperationHash, AttemptedIDHandlerInstance } from '../interfaces';

export default (operations: Array<OperationHash>, existingData: Array<OperationHash>, attemptedIDsHandler: AttemptedIDHandlerInstance) => {
	const master = _.uniqWith(existingData.concat(operations), _.isEqual);
	// Update the totals tallys in attemptedIDs
	attemptedIDsHandler.setScrapeTotal(existingData.length);
	attemptedIDsHandler.setDBTotal(master.length);
	return master;
}