import * as test 	from 'tape';
import * as _ 		from 'lodash';

import pullFromServer 	from './index';
import logger 			from '../logger';

import { UniqOperationHash, AttemptedIDs } from '../interfaces';

test('getOperations returns an array of objects with a numerical \'operation_id\' property', async t => {
	const response: Array<UniqOperationHash> = await pullFromServer.getOperations(logger()).catch(() => null);

	let result = _.isArray(response);
	let expected = true;
	t.equal(result, expected);

    if (response.length) {
    	result = !!response[0].operation_id;
    	t.equal(result, expected);
    	result = typeof response[0].operation_id === 'number';
    	t.equal(result, expected);
    }

	t.end();
});

test('getAttemptedIDs returns a hash with expected properties and types', async t => {
	const response: AttemptedIDs = await pullFromServer.getAttemptedIDs(logger()).catch(() => null);

	let result = response.hasOwnProperty('last_successful') && typeof response.last_successful === 'number';
	let expected = true;
	t.equal(result, expected);

	t.end();
});
