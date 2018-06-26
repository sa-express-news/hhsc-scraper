import * as puppeteer from 'puppeteer';

// interfaces
import { DeficiencyHash, DeficencyPopUpHash } from '../interfaces';

// modules
import scrapeNarrativePopups from	'../scrapeNarrativePopups';
import { clickButtonOnPage, resolveButtonClick } from '../handleClickEvents';

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
    technical_assistance_given: null,
    narrative: 'None',
});

export const getURL = (id: number) => `https://www.dfps.state.tx.us/Child_Care/Search_Texas_Child_Care/CCLNET/Source/Provider/ppComplianceHistory.aspx?fid=${id}&tab=2`;

export const closeSubscriptionModal = async page => {
	return await page.click('button.prefix-overlay-close.prefix-overlay-action-later').catch((err) => console.log('No modal'));
};

export const getDeficencyPage = async (id: number, browser: any) => {
	const page = await browser.newPage();
	await page.goto(getURL(id)).catch(handleError);
	// We need to handle the modal that pops up on page load
	await closeSubscriptionModal(page);
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

export const getValsMap = (popupContent: DeficencyPopUpHash) => ({
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
	technical_assistance_given: {
		func: () => popupContent.technical_assistance_given,
	},
	narrative: {
		func: () => popupContent.narrative,
	},
});

export const pluckValues = (cells, popupContent: DeficencyPopUpHash, elementHandle) => {
	const result: DeficiencyHash = defaultPayload();
	const valsMap = getValsMap(popupContent);
	for (let key in valsMap) {
		if (valsMap.hasOwnProperty(key)) {
			result[key] = valsMap[key].func(cells, elementHandle, valsMap[key].cellsIdx);
		}
	}
	return result;
};

export const getIncident = async (page, id: number, elementHandle) => {
	const cells 		= await elementHandle.$$eval('.dxgv', nodes => nodes.map(node => node.innerHTML.trim()));
	const popupContent 	= await scrapeNarrativePopups(elementHandle, page, getURL(id));
	return pluckValues(cells, popupContent, elementHandle);
};

export const findDeadButton = async page => {
	const deadButtons = await page.$$eval('b.dxp-button.dxp-bi.dxp-disabledButton', nodes => nodes.map(node => node.innerHTML.trim())).catch(() => []);
	const deadNextButton = deadButtons.filter(btn => btn.indexOf('<img src="../../App_Themes/Office2003%20Blue/Web/pNextDisabled.png" alt="Next">') !== -1);
	return deadNextButton.length === 1;
};

export const clickNextButton = async (page, id: number) => {
	const onClickSel = 'ASPx.GVPagerOnClick(\'ctl00_contentBase_tabSections_gridSummary\',\'PBN\');'
	const fullSel = `a.dxp-button.dxp-bi[onclick="${onClickSel}"]`;
	return clickButtonOnPage(page, fullSel, getURL(id));
};

export const scrapeRowsFromTable = async (payload: Array<DeficiencyHash>, page, id: number) => {
	const rows = await getDeficenciesRow(page);
	const incidents: Array<DeficiencyHash> = await Promise.all(rows.map(getIncident.bind(null, page, id))).catch(handleError);
	payload = payload.concat(incidents);

	const isDeadButton = await findDeadButton(page);
	if (!isDeadButton) {
		const isClickSuccessful = await clickNextButton(page, id);
		if (!isClickSuccessful) return payload;
		return await scrapeRowsFromTable(payload, page, id).catch(handleError);
	} else {
		return payload;
	}
};

export default async (id: number) => {
	const browser 		= await puppeteer.launch();
	const page 			= await getDeficencyPage(id, browser);

	const payload: Promise<Array<DeficiencyHash>> = await scrapeRowsFromTable([], page, id).catch(handleError);

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
			    technical_assistance_given: null,
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
			    technical_assistance_given: null,
			    narrative: 'this is a string',
			},
		],
		isSuccessful: true,
	};
}