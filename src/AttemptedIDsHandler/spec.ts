import * as test from 'tape';

import AttemptedIDsHandler from './index';

test('populate handler, add new values and eject', t => {
	const attemptedIDs = {
		last_successful: 1000,
	    last_attempted: 1500,
	    total_from_last_scrape: 46,
		total_in_database: 300,
	    facility_scraped_deficencies_rejected: [256, 400, 836],
	    facility_timeout_or_alert_page: [321, 699],
	};

	const range = [400, 836, 321, 699, 1501, 1502, 1503];

	const attemptedIDsHandler = new AttemptedIDsHandler(attemptedIDs, range);
	attemptedIDsHandler.newAttempt(1501);
	attemptedIDsHandler.newSuccess(1501);
	attemptedIDsHandler.newAttempt(1502);
	attemptedIDsHandler.newAttempt(1503);
	attemptedIDsHandler.rejectedFacility(1503);
	attemptedIDsHandler.newAttempt(836);
	attemptedIDsHandler.rejectedDeficency(836);
	attemptedIDsHandler.setScrapeTotal(100)
	attemptedIDsHandler.setDBTotal(400)


	let result = attemptedIDsHandler.ejectHash();
	let expected = {
		last_successful: 1501,
	    last_attempted: 1503,
	    total_from_last_scrape: 100,
		total_in_database: 400,
	    facility_scraped_deficencies_rejected: [256, 836],
	    facility_timeout_or_alert_page: [1503],
	};
	t.deepEqual(result, expected);

	t.end();
});