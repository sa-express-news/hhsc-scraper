import * as test from 'tape';
import * as puppeteer from 'puppeteer';

import { 
	getDeficencyPage,
	getDeficenciesRow,
	getIncident,
	findDeadButton,
	clickNextButton,
	scrapeRowsFromTable,
} from './index';

const runTests = async () => {
	const debugOpts = { headless: false, slowMo: 250 };
	const browser = await puppeteer.launch();

	test('puppeteer pulls the ten deficencies from the page and stores them in a NodeList', async t => {
		const page = await getDeficencyPage(95732, browser);
		const rows = await getDeficenciesRow(page);

		let boolResult = rows.length === 10;
		let boolRxpected = true;
		t.equal(boolResult, boolRxpected);

		await page.close();
		t.end();
	});

	test('getIncident: should return a DeficiencyHash with scraped values', async t => {
		const page = await getDeficencyPage(1252288, browser);
		const rows = await getDeficenciesRow(page);

		let result = await getIncident(page, 1252288, rows[0]);
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
		const page = await getDeficencyPage(141349, browser);
		
		await clickNextButton(page, 141349);
		const rows = await getDeficenciesRow(page);

		let result = await getIncident(page, 141349, rows[0]);
		let expected = {
			activity_date: '7/10/2017',
			activity_id: null,
			standard_number_description: '748.1387 - Service Plan Review-Must comply with notification, participation, implementation, and documentation requirements for an initial service plan',
			activity_type: 'Monitoring Inspections',
			standard_risk_level: 'Medium Low',
			corrected_at_inspection: false,
			corrected_date: '7/24/2017',
			date_correction_verified: '7/31/2017',
			technical_assistance_given: false,
			narrative: 'One of the children\'s records reviewed found  no documentation of PLSP, child, managing conservator, and caregiver participated, reviewed, and/or approved child\'s plan.'
		};
		t.deepEqual(result, expected);

		await page.close();
		t.end();
	});

	test('findDeadButton: When we reach the end of pagination, this should stop the process', async t => {
		const page = await getDeficencyPage(95732, browser);
		let successfulClicks = 0;
		let isSuccessfulClick = false;

		let isButtonDead = await findDeadButton(page);

		while (!isButtonDead) {
			isSuccessfulClick = await clickNextButton(page, 95732);
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

	test('scrapeRowsFromTable: Should grab all possible deficiencies and return array of hashes', async t => {
		const page = await getDeficencyPage(95732, browser);

		const deficiencies = await scrapeRowsFromTable([], page, 95732);
		
		let resultFirstDeficency = deficiencies[0]
		let expectedFirstDeficiency = { 
			activity_date: '12/16/2017',
		    activity_id: null,
		    standard_number_description: '749.1803(e) - Infant requirements-Infant must never be left unsupervised',
		    activity_type: 'Self Reported Incidents',
		    standard_risk_level: 'High',
		    corrected_at_inspection: false,
		    corrected_date: '1/19/2018',
		    date_correction_verified: '1/19/2018',
		    technical_assistance_given: true,
		    narrative: 'Foster parent was heard yelling and speaking very aggressively towards child in care.'
		};
		t.deepEqual(resultFirstDeficency, expectedFirstDeficiency);

		let resultLastDeficency = deficiencies[deficiencies.length - 1];
		let expectedLastDeficiency = { 
			activity_date: '7/20/2015',
		    activity_id: null,
		    standard_number_description: '749.1957(1) - Other Prohibited Discipline-Any harsh, cruel, unusual, unnecessary, demeaning, or humiliating discipline or punishment',
		    activity_type: 'Reports',
		    standard_risk_level: 'High',
		    corrected_at_inspection: false,
		    corrected_date: '10/2/2015',
		    date_correction_verified: '10/2/2015',
		    technical_assistance_given: true,
		    narrative: 'Foster parent was heard yelling and speaking very aggressively towards child in care.'
		};
		t.deepEqual(resultFirstDeficency, expectedFirstDeficiency);

		let resultLen = deficiencies.length;
		let expectedLen = 37
		t.equal(resultLen, expectedLen);

		await page.close();
		t.end();
		process.exit(0)
	});
}
runTests();
