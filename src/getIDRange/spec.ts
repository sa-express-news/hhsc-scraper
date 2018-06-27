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
		last_successful: 1000,
	    last_attempted: 1500,
	    facility_scraped_deficencies_rejected: [256, 400, 836],
	    hit_alert_page_on_facility_scrape_attempt: [321, 699],
	};
	const scope = 1000
	const range = buildRange(attemptedIDs, scope);

	let arrResult = range.slice(0, 7);
	let arrExpected = [256,400,836,321,699,1501,1502];
	t.deepEqual(arrResult, arrExpected);

	let numResult = range.length;
	let numExpected = 1000;
	t.equal(numResult, numExpected);

	t.end();
});

