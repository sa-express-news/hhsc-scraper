import * as test from 'tape';
import * as puppeteer from 'puppeteer';

import scrapeDefiencyDetails, { 
	getURL,
	getIncident,
	scrapeNarrativePopups,
} from './index';
import {
	getDeficencyPage,
	getDeficenciesRow,
	findDeadButton,
	clickNextButton,
} from '../headlessBrowserUtils';

const runTests = async () => {
	const debugOpts = { headless: false, slowMo: 250 };
	const browser = await puppeteer.launch();

	test('puppeteer pulls the ten deficencies from the page and stores them in a NodeList', async t => {
		const page = await getDeficencyPage(getURL(95732), browser);
		const rows = await getDeficenciesRow(page);

		let boolResult = rows.length === 10;
		let boolRxpected = true;
		t.equal(boolResult, boolRxpected);

		await page.close();
		t.end();
	});

	test('getIncident: should return a DeficiencyHash with scraped values', async t => {
		const page = await getDeficencyPage(getURL(1252288), browser);
		const rows = await getDeficenciesRow(page);

		let result = await getIncident(rows[0], page, getURL(1252288));
		let expected = {
			activity_date: '6/15/2018',
			activity_id: null,
			standard_number_description: '748.1003(a) - Child/caregiver ratio-Caregiver may care for 5 children if any require tx svcs, 8 children if not; children under 5 yrs old count as 2 children',
			activity_type: 'Assessments',
			standard_risk_level: 'Medium High',
			corrected_at_inspection: false,
			corrected_date: '6/18/2018',
			date_correction_verified: '6/18/2018',
			technical_assistance_given: false,
			narrative: 'On 6/9/2018 the operation was out of ratio in three cottages. Staff were in training and not in the cottages.'
		};
		t.deepEqual(result, expected);

		await page.close();
		t.end();
	});

	test('clickNextButton: should return successful selector if button was clicked, or null if not', async t => {
		const page = await getDeficencyPage(getURL(141349), browser);
		
		await clickNextButton(page, getURL(141349));
		const rows = await getDeficenciesRow(page);

		let result = await getIncident(rows[0], page, getURL(141349));
		let expected = { 
			activity_date: '7/10/2017',
			activity_id: null,
			standard_number_description: '748.1209(a) - Child Orientation-Provided to child who is 5 years old or older within 7 days of admission and geared to child\'s intellectual level',
			activity_type: 'Monitoring Inspections',
			standard_risk_level: 'Medium Low',
			corrected_at_inspection: false,
			corrected_date: '7/24/2017',
			date_correction_verified: '7/31/2017',
			technical_assistance_given: false,
			narrative: 'One of the children\'s records reviewed found child was not oriented within 7 days of placement.'
		};
		t.deepEqual(result, expected);

		await page.close();
		t.end();
	});

	test('findDeadButton: When we reach the end of pagination, this should stop the process', async t => {
		const page = await getDeficencyPage(getURL(95732), browser);
		let successfulClicks = 0;
		let isSuccessfulClick = false;

		let isButtonDead = await findDeadButton(page);

		while (!isButtonDead) {
			isSuccessfulClick = await clickNextButton(page, getURL(95732));
			if (!isSuccessfulClick) break;
			successfulClicks++;
			console.log(`${successfulClicks} successful clicks`);
			isButtonDead = await findDeadButton(page);
		}

		let result = successfulClicks;
		let expected = 3;
		t.equal(result, expected);

		await page.close();
		t.end();
	});

	test('scrapeNarrativePopups: return hash with content from narrative popup', async t => {
		const page = await getDeficencyPage(getURL(95732), browser);
		const rows = await getDeficenciesRow(page);

		let result = await scrapeNarrativePopups(rows[0], page, getURL(95732));
		let expected = { 
			technical_assistance_given: true, 
			narrative: 'Child in care sustained an eyelid injury while parent was not within eyesight range preventing her from being  able to intervene.',
		};
		t.deepEqual(result, expected);

		await page.close();
		t.end();
	});

	test('scrapeDefiencyDetails: Should grab all possible deficiencies and return array of hashes under payload with isSuccessful: true', async t => {
		const response = await scrapeDefiencyDetails(272125, browser);
		const deficiencies = response.payload;
		
		let resultFirstDeficency = deficiencies[0]
		let expectedFirstDeficiency = {
			activity_date: '5/29/2018',
			activity_id: null,
			standard_number_description: '748.3101(2) - Fire Inspection-Must have fire inspection at least once every 12 months from date of last fire inspection',
			activity_type: 'Assessments',
			standard_risk_level: 'Medium High',
			corrected_at_inspection: false,
			corrected_date: '6/1/2018',
			date_correction_verified: '6/4/2018',
			technical_assistance_given: true,
			narrative: 'A fire inspection was not provided by the operation.'
		};
		t.deepEqual(resultFirstDeficency, expectedFirstDeficiency);

		let resultLastDeficency = deficiencies[deficiencies.length - 1];
		let expectedLastDeficiency = {
			activity_date: '5/29/2018',
			activity_id: null, 
			standard_number_description: '748.3101(2) - Fire Inspection-Must have fire inspection at least once every 12 months from date of last fire inspection',
			activity_type: 'Assessments',
			standard_risk_level: 'Medium High',
			corrected_at_inspection: false,
			corrected_date: '6/1/2018',
			date_correction_verified: '6/4/2018',
			technical_assistance_given: true,
			narrative: 'A fire inspection was not provided by the operation.'
		};
		t.deepEqual(resultFirstDeficency, expectedFirstDeficiency);

		let resultLen = deficiencies.length;
		let expectedLen = 63
		t.equal(resultLen, expectedLen);

		t.end();
		process.exit(0)
	});
}
runTests();
