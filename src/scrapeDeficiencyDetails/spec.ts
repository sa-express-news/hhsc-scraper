import * as test from 'tape';
import * as puppeteer from 'puppeteer';

import scrapeDefiencyDetails, { 
    getURL,
    getIncident,
    scrapeNarrativePopups,
    parseNarrativeResponse,
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

	test('puppeteer pulls the ten deficencies from the page and stores them in a NodeList', async t => {
		const page = await getDeficencyPage(getURL(95732), browser, logger());
		const rows = await getDeficenciesRow(page);

		let boolResult = rows.length === 10;
		let boolRxpected = true;
		t.equal(boolResult, boolRxpected);

		await page.close();
		t.end();
	});

	test('getIncident: should return a DeficiencyHash with scraped values', async t => {
		const page = await getDeficencyPage(getURL(1252288), browser, logger());
		const rows = await getDeficenciesRow(page);
		const incident = await getIncident(rows[0], page, getURL(1252288), logger());

		let result = incident.narrative;
		let expected = 'A child\\\\\\\'s medication log documented more dispensed medication given to the child than the actual amount of medication the child had.';
		t.equal(result, expected);

		await page.close();
		t.end();
	});

	test('clickNextButton: should return successful selector if button was clicked, or null if not', async t => {
		const page = await getDeficencyPage(getURL(141349), browser, logger());
		
		await clickNextButton(page, getURL(141349), logger());
		const rows = await getDeficenciesRow(page);
		const incident = await getIncident(rows[0], page, getURL(141349), logger());

		let result = incident.narrative;
		let expected = 'One of the children\\\\\\\'s records reviewed found child was not oriented within 7 days of placement.';
		t.equal(result, expected);

		await page.close();
		t.end();
	});

	test('isNextButton: When we reach the end of pagination, this should stop the process', async t => {
		const page = await getDeficencyPage(getURL(95732), browser, logger());
		let successfulClicks = 0;
		let isSuccessfulClick = false;

		let nextButton = await isNextButton(page, logger());

		while (nextButton) {
			isSuccessfulClick = await clickNextButton(page, getURL(95732), logger());
			if (!isSuccessfulClick) break;
			successfulClicks++;
			console.log(`${successfulClicks} successful clicks`);
			nextButton = await isNextButton(page, logger());
		}

		let result = successfulClicks;
		let expected = 2;
		t.equal(result, expected);

		await page.close();
		t.end();
	});

	test('parseNarrativeResponse: Should take a narrative response string and return a cleanly parsed object', t => {
		let result = parseNarrativeResponse("0|/*DX*/({'result':{'html':'FB|0|\'During the course of the investigation is was discovered that a caregiver did not follow up with the primary care physician as recommended by hospital staff.^Yes\''},'id':0})");
		let expected = {
			narrative: 'During the course of the investigation is was discovered that a caregiver did not follow up with the primary care physician as recommended by hospital staff.',
			technical_assistance_given: true,
		}
		t.deepEqual(result, expected);
		t.end();
	});

	test('scrapeNarrativePopups: return hash with content from narrative popup', async t => {
		const page = await getDeficencyPage(getURL(95732), browser, logger());
		const rows = await getDeficenciesRow(page);

		let result = await scrapeNarrativePopups(rows[0], page, getURL(95732), logger());
		let expected = {  
			narrative: 'Caregiver admitted to asking child to lay on ground and proceeded to put chair over the child\\\\\\\'s legs/feet to prevent child from running. Caregiver also admitted to slapping the top of child\\\\\\\'s hand one time while child was in the home.',
			technical_assistance_given: true,
		};
		t.deepEqual(result, expected);

		await page.close();
		t.end();
	});

	test('scrapeDefiencyDetails: Should grab all possible deficiencies and return array of hashes under payload with isSuccessful: true', async t => {
		const response = await scrapeDefiencyDetails(272125, browser, logger());
		const deficiencies = removeDuplicates(addIDs(response.payload, 0));
		
		let resultFirstDeficency = deficiencies[0].narrative
		let expectedFirstDeficiency = 'In one child\\\\\\\'s record review there was no preliminary service plan.';
		t.equal(resultFirstDeficency, expectedFirstDeficiency);

		let resultLastDeficency = deficiencies[deficiencies.length - 1].narrative;
		let expectedLastDeficiency = 'This standard was assessed and determined to be deficient.';
		t.equal(resultLastDeficency, expectedLastDeficiency);

		let resultLen = deficiencies.length;
		let expectedLen = 81
		t.equal(resultLen, expectedLen);

		t.end();
		await browser.close();
	});
}
runTests();
