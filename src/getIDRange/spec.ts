import * as test from 'tape';
import { 
	getFinish,
	spreadRange,
	buildRange,
} from './index';

test('getFinish should return finish val, if it exists', t => {
	let result = getFinish({
		start: 800,
		finish: 1000,
	}, 1000);
	let expected = 1000;
	t.equal(result, expected);
	t.end();
});

test('getFinish should return start val + range, if finish does not exists on payload', t => {
	let result = getFinish({
		start: 800,
	}, 1000);
	let expected = 1800;
	t.equal(result, expected);
	t.end();
});

test('spreadRange should take two sequential numbers and spread them into iterated array', t => {
	let result = spreadRange(1000, 2001).length;
	let expected = 1001;
	t.equal(result, expected);
	t.end();
});

test('buildRange should figure out start point and remining spaces from attemptedIDs and then tack remaining scope on to build the full range', t => {
	const attemptedIDs = {
        last_successful: 60000,
        last_attempted: 65000,
	    total_from_last_scrape: 46,
        total_in_database: 300,
	    facility_scraped_deficencies_rejected: [61256, 61400, 63836],
	    facility_timeout_or_alert_page: [62321, 64699],
	};
	const scope = 1000
	const range = buildRange(attemptedIDs, scope);

	let arrResult = range.slice(0, 7);
	let arrExpected = [61256,61400,63836,62321,64699,65001,65002];
	t.deepEqual(arrResult, arrExpected);

	let numResult = range.length;
	let numExpected = 1000;
	t.equal(numResult, numExpected);

	t.end();
});

