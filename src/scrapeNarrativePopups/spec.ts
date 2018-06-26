import * as test from 'tape';
import * as puppeteer from 'puppeteer';

import { getURL, getDeficencyPage, getDeficenciesRow } from '../scrapeDeficiencyDetails';
import scrapeNarrativePopups from './index';

const runTests = async () => {
	const debugOpts = { headless: false, slowMo: 250 };
	const browser = await puppeteer.launch();

	test('scrapeNarrativePopups: return hash with content from narrative popup', async t => {
		const page = await getDeficencyPage(95732, browser);
		const rows = await getDeficenciesRow(page);

		let result = await scrapeNarrativePopups(rows[0], page, getURL(95732));
		let expected = { 
			technical_assistance_given: true, 
			narrative: 'Child in care sustained an eyelid injury while parent was not within eyesight range preventing her from being  able to intervene.',
		};
		t.deepEqual(result, expected);

		await browser.close();
		t.end();
		process.exit(0);
	});
}
runTests();
