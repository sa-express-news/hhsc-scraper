import * as test from 'tape';

import AttemptedIDsHandler from './index';

test('populate handler, add new values and eject', t => {
	const attemptedIDs = {
		last_successful: 1000,
	    last_attempted: 1500,
	    facility_scraped_deficencies_rejected: [256, 400, 836],
	    hit_alert_page_on_facility_scrape_attempt: [321, 699],
	};

	const range = [400, 836, 321, 699, 1501, 1502, 1503];

	const attemptedIDsHandler = new AttemptedIDsHandler(attemptedIDs, range);
	attemptedIDsHandler.newAttempt(1501);
	attemptedIDsHandler.newSuccess(1501);
	attemptedIDsHandler.newAttempt(1502);
	attemptedIDsHandler.newAttempt(1503);
	attemptedIDsHandler.rejectedByAlert(1503);
	attemptedIDsHandler.newAttempt(836);
	attemptedIDsHandler.rejectedDeficency(836);



	let result = attemptedIDsHandler.ejectHash();
	let expected = {
		last_successful: 1501,
	    last_attempted: 1503,
	    facility_scraped_deficencies_rejected: [256, 836],
	    hit_alert_page_on_facility_scrape_attempt: [1503],
	};
	t.deepEqual(result, expected);

	t.end();
});