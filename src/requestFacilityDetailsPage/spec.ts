import * as test from 'tape';

import { getPage, readPage } 	from './index';
import logger 					from '../logger';

test('getPage grabs page associated with given operation ID', async t => {
	let html = await getPage(111812, logger());
	let $ = readPage(html);
	let td = $('font:contains("256183")', 'td');
	let result = td.text().trim();
	let expectation = '256183';
	t.equal(result, expectation);
	t.end();
});
