import * as test from 'tape';
import * as puppeteer from 'puppeteer';

import scrapeDefiencyDetails, { 
    getURL,
    getIncident,
    scrapeNarrativePopups,
    parseNarrativePopup,
} 								from './index';
import {
    getDeficencyPage,
    getDeficenciesRow,
    isNextButton,
    clickNextButton,
} 								from '../headlessBrowserUtils';
import logger 					from '../logger';
import { addIDs }               from '../addUniqueID';
import { removeDuplicates }     from '../mergeDataToMaster';

const runTests = async () => {
	const debugOpts = { headless: false, slowMo: 250 };
	const browser = await puppeteer.launch();

	// test('puppeteer pulls the ten deficencies from the page and stores them in a NodeList', async t => {
	// 	const page = await getDeficencyPage(getURL(95732), browser, logger());
	// 	const rows = await getDeficenciesRow(page);

	// 	let boolResult = rows.length === 10;
	// 	let boolRxpected = true;
	// 	t.equal(boolResult, boolRxpected);

	// 	await page.close();
	// 	t.end();
	// });

	// test('getIncident: should return a DeficiencyHash with scraped values', async t => {
	// 	const page = await getDeficencyPage(getURL(1252288), browser, logger());
	// 	const rows = await getDeficenciesRow(page);
	// 	const incident = await getIncident(rows[0], page, getURL(1252288), logger());

	// 	let result = incident.narrative;
	// 	let expected = 'A child was able to obtain and take medication which had been prescribed to a different child.';
	// 	t.equal(result, expected);

	// 	await page.close();
	// 	t.end();
	// });

	// test('clickNextButton: should return successful selector if button was clicked, or null if not', async t => {
	// 	const page = await getDeficencyPage(getURL(141349), browser, logger());
		
	// 	await clickNextButton(page, getURL(141349), logger());
	// 	const rows = await getDeficenciesRow(page);
	// 	const incident = await getIncident(rows[0], page, getURL(141349), logger());

	// 	let result = incident.narrative;
	// 	let expected = 'There was no training observed in the record reviewed The file is not current and up to date .';
	// 	t.equal(result, expected);

	// 	await page.close();
	// 	t.end();
	// });

	// test('isNextButton: When we reach the end of pagination, this should stop the process', async t => {
	// 	const page = await getDeficencyPage(getURL(141349), browser, logger());
	// 	let successfulClicks = 0;
	// 	let isSuccessfulClick = false;

	// 	let nextButton = await isNextButton(page, logger());

	// 	while (nextButton) {
	// 		isSuccessfulClick = await clickNextButton(page, getURL(141349), logger());
	// 		if (!isSuccessfulClick) break;
	// 		successfulClicks++;
	// 		nextButton = await isNextButton(page, logger());
	// 	}

	// 	let result = successfulClicks;
	// 	let expected = 6;
	// 	t.equal(result, expected);

	// 	await page.close();
	// 	t.end();
	// });

	test('parseNarrativePopup: Should take a narrative response string and return a cleanly parsed object', t => {
		let result = parseNarrativePopup("0|/*DX*/({'result':{'html':'FB|0|\'Operation staff confirmed the injury happened in April 2019 and this report came in 06-10-2019.^Yes^Compliance met^Compliance verified on 08/26/2019\\r\\n08-26-2019. The operation emailed the investigating inspector a compliance response indicating they emailed the assigned inspector on 07-29-2019 that staff met with the foster parent and reviewed reporting standards.\\r\\n\\r\\n08-23-2019. I emailed the operation and requested a compliance response.\''},'id':0})");
		let expected = {
			narrative: 'During the course of the investigation is was discovered that a caregiver did not follow up with the primary care physician as recommended by hospital staff.',
			technical_assistance_given: true,
			correction: 'Compliance verified on 08/26/2019 08-26-2019. The operation emailed the investigating inspector a compliance response indicating they emailed the assigned inspector on 07-29-2019 that staff met with the foster parent and reviewed reporting standards.\\r\\n\\r\\n08-23-2019. I emailed the operation and requested a compliance response.',
		}
		t.deepEqual(result, expected);
		t.end();
	});

	test('scrapeNarrativePopups: return hash with content from narrative popup', async t => {
		const page = await getDeficencyPage(getURL(272125), browser, logger());
		const rows = await getDeficenciesRow(page);

		let result = await scrapeNarrativePopups(rows[0], page, getURL(272125), logger());
		let expected = {  
			narrative: 'Operation staff confirmed the injury happened in April 2019 and this report came in 06-10-2019.',
			technical_assistance_given: true,
			correction: 'Compliance verified on 08/13/2019 Follow Up 8/13/19: Fire Extinguishers were inspected July 2019 and August 2019 in both buildings.',
		};
		t.deepEqual(result, expected);

		await page.close();
		t.end();
		await browser.close();
	});

	// test('scrapeDefiencyDetails: Should grab all possible deficiencies and return array of hashes under payload with isSuccessful: true', async t => {
	// 	const response = await scrapeDefiencyDetails(272125, browser, logger());
	// 	const deficiencies = removeDuplicates(addIDs(response.payload, 0));
		
	// 	let resultFirstDeficency = deficiencies[0].narrative
	// 	let expectedFirstDeficiency = 'Fire extinguishers in both floors expired in June 2019.';
	// 	t.equal(resultFirstDeficency, expectedFirstDeficiency);

	// 	let resultLastDeficency = deficiencies[deficiencies.length - 1].narrative;
	// 	let expectedLastDeficiency = 'This standard was assessed and determined to be deficient.';
	// 	t.equal(resultLastDeficency, expectedLastDeficiency);

	// 	let resultLen = deficiencies.length;
	// 	let expectedLen = 70
	// 	t.equal(resultLen, expectedLen);

	// 	t.end();
	// 	await browser.close();
	// });
}
runTests();
