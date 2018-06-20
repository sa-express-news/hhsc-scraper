import * as test from 'tape';
import { getFinish } from './index';

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
