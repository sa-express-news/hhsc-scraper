import * as puppeteer from 'puppeteer';

// interfaces
import { DeficiencyHash } from '../interfaces';

const handleError = (err: any) => {
	console.error(err);
	return null;
}

const defaultPayload = () => ({
	activity_date: 'None',
    activity_id: null,
    standard_number_description: 'None',
    activity_type: 'None',
    standard_risk_level: 'None',
    corrected_at_inspection: null,
    corrected_date: 'None',
    date_correction_verified: 'None',
    narrative: 'None',
});

export const getURL = (id: number) => `https://www.dfps.state.tx.us/Child_Care/Search_Texas_Child_Care/CCLNET/Source/Provider/ppComplianceHistory.aspx?fid=${id}&tab=2`;

export const getDeficencyPage = async (id: number, browser: any) => {
	const page = await browser.newPage();
	await page.goto(getURL(id)).catch(handleError);
	return page;
};

export const getDeficenciesRow = page => page ? page.$$('#ctl00_contentBase_tabSections_C1 .dxgvDataRow_Glass') : [];

export const getString = (cells, elementHandle, cellsIdx: number) => typeof cells[cellsIdx] === 'string' && cells[cellsIdx].length > 0 ? cells[cellsIdx] : 'None'

export const getBoolean = (cells, elementHandle, cellsIdx: number) => {
	if (typeof cells[cellsIdx] === 'string' && cells[cellsIdx].length > 0) {
		return cells[cellsIdx] !== 'No';
	} else {
		return null;
	}
};

export const getValsMap = () => ({
	activity_date: {
		func: getString,
		cellsIdx: 0,
	},
    standard_number_description: {
		func: getString,
		cellsIdx: 1,
	},
    activity_type: {
		func: getString,
		cellsIdx: 2,
	},
    standard_risk_level: {
		func: getString,
		cellsIdx: 3,
	},
    corrected_at_inspection: {
		func: getBoolean,
		cellsIdx: 4,
	},
    corrected_date: {
		func: getString,
		cellsIdx: 5,
	},
    date_correction_verified: {
		func: getString,
		cellsIdx: 6,
	},
});

export const pluckValues = (cells, elementHandle) => {
	const result: DeficiencyHash = defaultPayload();
	const valsMap = getValsMap();
	for (let key in valsMap) {
		if (valsMap.hasOwnProperty(key)) {
			result[key] = valsMap[key].func(cells, elementHandle, valsMap[key].cellsIdx);
		}
	}
	return result;
};

export const getIncident = async elementHandle => {
	const cells = await elementHandle.$$eval('.dxgv', nodes => nodes.map(node => node.innerHTML.trim()));
	return pluckValues(cells, elementHandle);
};

export const scrapeRowsFromTable = async (payload: Array<DeficiencyHash>, page) => {
	const rows = await getDeficenciesRow(page);
	const incidents = await Promise.all(rows.map(getIncident)).catch(handleError);
	payload = payload.concat(incidents);

	// grab rows from page
	// iterate over rows and grab inner elements from each
	// grab value from each inner element and return one hash per row
	// push the results to payload and flatten
	// afterwards, click the button and wait to see if another row loads
	// if row has loaded, restart the process
	// when button finally fails to return results, return payload
};

export default async (id: number) => {
	const browser 		= await puppeteer.launch();
	const page 			= await getDeficencyPage(id, browser);

	const payload: Promise<Array<DeficiencyHash>> = await scrapeRowsFromTable([], page).catch(handleError);

	return {
		payload: [
			{
				activity_date: 'this is a string',
			    activity_id: 999,
			    standard_number_description: 'this is a string',
			    activity_type: 'this is a string',
			    standard_risk_level: 'this is a string',
			    corrected_at_inspection: true,
			    corrected_date: 'this is a string',
			    date_correction_verified: 'this is a string',
			    narrative: 'this is a string',
			},
			{
				activity_date: 'this is a string',
			    activity_id: 999,
			    standard_number_description: 'this is a string',
			    activity_type: 'this is a string',
			    standard_risk_level: 'this is a string',
			    corrected_at_inspection: true,
			    corrected_date: 'this is a string',
			    date_correction_verified: 'this is a string',
			    narrative: 'this is a string',
			},
		],
		isSuccessful: true,
	};
}