import * as test from 'tape';
import * as puppeteer from 'puppeteer';

import { 
	getDeficencyPage,
	getDeficenciesRow,
	getIncident,
} from './index';

test('puppeteer pulls the ten deficencies from the page and stores them in a NodeList', async t => {
	const browser 	= await puppeteer.launch();
	const page 		= await getDeficencyPage(95732, browser);
	const rows		= await getDeficenciesRow(page);

	let boolResult = rows.length === 10;
	let boolRxpected = true;
	t.equal(boolResult, boolRxpected);

	await browser.close();
	t.end();
});

test('getIncident: should return a DeficiencyHash with scraped values', async t => {
	const browser 	= await puppeteer.launch();
	const page 		= await getDeficencyPage(1252288, browser);
	const rows		= await getDeficenciesRow(page);

	let result = await getIncident(rows[0]);
	let expected = {
		activity_date: '6/15/2018',
		activity_id: null,
		standard_number_description: '748.1003(a) - Child/caregiver ratio-Caregiver may care for 5 children if any require tx svcs, 8 children if not; children under 5 yrs old count as 2 children',
		activity_type: 'Assessments',
		standard_risk_level: 'Medium High',
		corrected_at_inspection: false,
		corrected_date: '6/18/2018',
		date_correction_verified: '6/18/2018',
		narrative: 'None' 
	};
	t.deepEqual(result, expected);

	await browser.close();
	t.end();
});