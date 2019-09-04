import * as _ from 'lodash';

// interfaces
import { 
	DeficiencyHash,
	DeficencyPopUpHash,
	DeficencyHashMap,
}                                               from '../interfaces';
import { Browser, Page, ElementHandle, Dialog } from 'puppeteer';
import { Logger }                               from 'winston';

// modules
import { 
	getDeficencyPage,
	getDeficenciesRow,
	isNextButton,
	clickNextButton,
	getCells,
	clickElement, 
	getNarrativeLink,
	closeNarrativeBox,
} from '../headlessBrowserUtils';

const failedScrape = () => ({ isSuccessful: false, payload: [] });

const handleError = (payload: Array<DeficiencyHash>, err: any, logger: Logger) => {
	logger.error(err);
	return payload;	
}

const handleNarrativeError = (err: any, logger: Logger) => {
	logger.error(err);
	return { narrative: 'Error retrieving', correction: 'Error retrieving', };
}

const defaultPayload = () => ({
    activity_date: 'None',
    standard_number_description: 'None',
    activity_type: 'None',
    standard_risk_level: 'None',
    corrected_at_inspection: null,
    corrected_date: 'None',
    date_correction_verified: 'None',
    technical_assistance_given: null,
	narrative: 'None',
	correction: 'None',
});

export const getValsMap = (popupContent: DeficencyPopUpHash) => ({
    activity_date: { func: getDate, cellsIdx: 0 },
    standard_number_description: { func: getString, cellsIdx: 1 },
    activity_type: { func: getString, cellsIdx: 2 },
    standard_risk_level: { func: getString, cellsIdx: 3 },
    corrected_at_inspection: { func: getBoolean, cellsIdx: 4 },
    corrected_date: { func: getDate, cellsIdx: 5 },
    date_correction_verified: { func: getDate, cellsIdx: 6 },
    technical_assistance_given: { func: () => popupContent.technical_assistance_given },
	narrative: { func: () => popupContent.narrative },
	correction: { func: () => popupContent.correction },
});

export const getURL = (id: number) => `https://www.dfps.state.tx.us/Child_Care/Search_Texas_Child_Care/CCLNET/Source/Provider/ppComplianceHistory.aspx?fid=${id}&tab=2`;

export const getString = (cells, cellsIdx: number) => typeof cells[cellsIdx] === 'string' && cells[cellsIdx].length > 0 ? cells[cellsIdx] : 'None'

export const getBoolean = (cells, cellsIdx: number) => {
	if (typeof cells[cellsIdx] === 'string' && cells[cellsIdx].length > 0) {
		return cells[cellsIdx] !== 'No';
	} else {
		return null;
	}
};

export const getDate = (cells, cellsIdx: number) => {
	const str = getString(cells, cellsIdx);
	return str === '&nbsp;' ? '' : str;
};

// use our hash map to pluck the corresponding values from the cells in the TD element
export const pluckValues = async (cells: Array<string | number>, popupContent: DeficencyPopUpHash, element: ElementHandle) => {
	const result: DeficiencyHash = defaultPayload();
	const valsMap: DeficencyHashMap = getValsMap(popupContent);
	for (let key in valsMap) {
		if (valsMap.hasOwnProperty(key)) {
			result[key] = await valsMap[key].func(cells, valsMap[key].cellsIdx, element);
		}
	}
	return result;
};

// we grab the response data after clicking the popup link and parse it using regex.
export const parseNarrativePopup = (response: string) => {
	const bump 	= response.indexOf("FB|0|\\'") !== -1 ? 4 : 3; // handling the oddities of the string response
	const start = "0|/*DX*/({'result':{'html':'FB|".length + bump;
	const end	= response.indexOf("\\''},'id':0})");

	const pluckFromPopup = (start: number, end: number): string => response.slice(start, end).trim().replace(/\s\s+/g, ' ');
	
	const narrative 					= pluckFromPopup(start, response.indexOf('^'));
	const technical_assistance_given 	= response.indexOf('^Yes') !== -1;
	const correction 					= pluckFromPopup(response.lastIndexOf('^') + 1, end).replace(/\\\\r\\\\n/, ' ');

	return { narrative, technical_assistance_given, correction };
};

export const isCrossThreadError = (narrative: string) => {
	// this handles a frustrating problem with the HHSC website. Occassionally, clicking on the narrative popup will trigger a DevExpress cross thread issue on their backend
	// we have to handle this in two ways. First we need to dismiss the popup (done via listener set in default), second we need to request the popup a second time
	return narrative.indexOf('generalError') !== -1;
};

// here we need to click on the link to open the popup containing the narrative and the technical_assitance_given number, once we open the popup, we scrape it. 
// The HHSC website can be super buggy here and we need to handle possible errors, sometimes recursively trying to click the link again but also being prepared to bail and try again later
export const scrapeNarrativePopups = async (element: ElementHandle, page: Page, url: string, logger: Logger) => {
	const el 		= await getNarrativeLink(element);
	const response 	= await clickElement(el, page, url, logger);

	if (response) {
		await closeNarrativeBox(page, logger);
		return isCrossThreadError(response) ? await scrapeNarrativePopups(element, page, url, logger) : parseNarrativePopup(response);
	} else {
		return Object.assign({}, { technical_assistance_given: null }, handleNarrativeError('Popup click failed!', logger));
	}
};

export const getIncident = async (element: ElementHandle, page: Page, url: string, logger: Logger) => {
	const cells: Array<string | number> 	= await getCells(element);
	const popupContent: DeficencyPopUpHash 	= await scrapeNarrativePopups(element, page, url, logger);
	return await pluckValues(cells, popupContent, element);
};

export const getIncidentRow = async (rows: Array<ElementHandle>, page: Page, url: string, logger: Logger) => {
	const incidents: Array<DeficiencyHash> = [];
	let incident: DeficiencyHash;

	for (let i = 0; i < rows.length; i++) {
		incident = await getIncident(rows[i], page, url, logger)
		incidents.push(incident);
	}

	return incidents;
};

// this is a recursive function that takes scrapes data from all the table rows and then attempts to click the table pagination button
// if a second table page is successfully loaded, the function runs again, continously until no more table pages are available to scrape
export const scrapeRowsFromTable = async (payload: Array<DeficiencyHash>, page: Page, url: string, rows: Array<ElementHandle>, logger: Logger) => {
	const incidents: Array<DeficiencyHash> = await getIncidentRow(rows, page, url, logger).catch((err) => err);
	if (!incidents) return handleError(payload, incidents, logger);

	payload = payload.concat(incidents);

	const nextButton: boolean = await isNextButton(page, logger);
	if (nextButton) {
		const isClickSuccessful = await clickNextButton(page, url, logger);
		if (!isClickSuccessful) return payload;

		const nextRows: Array<ElementHandle> = await getDeficenciesRow(page);
		if (nextRows.length === 0) return payload;

		return await scrapeRowsFromTable(payload, page, url, nextRows, logger).catch((err) => handleError(payload, err, logger));
	} else {
		return payload;
	}
};

const getDialogListener = (logger: Logger) => async (dialog: Dialog) => {
	// Occassionally when a narrative is requested, the HHSC website returns a Cross-thread operation error
	// this listener dismisses the resulting popup
	logger.info(`Dismissing dialog: ${dialog.message()}`);
	await dialog.dismiss();
};

const turnOnDialogListener = (page: Page, dialogListener) => page.on('dialog', dialogListener);

const turnOffDialogListener = (page: Page, dialogListner) => page.removeListener('dialog', dialogListner);

export default async (id: number, browser: Browser, logger: Logger) => {
	const page: Page = await getDeficencyPage(getURL(id), browser, logger);
	if (!page) return failedScrape();

	const dialogListener = getDialogListener(logger);
	turnOnDialogListener(page, dialogListener);

	// find the table of deficencies of the page and pluck all the rows (deficencies) from said table
	const rows: Array<ElementHandle> = await getDeficenciesRow(page);
	if (rows.length === 0) return failedScrape();

	const payload: Array<DeficiencyHash> = await scrapeRowsFromTable([], page, getURL(id), rows, logger).catch((err) => handleError([], err, logger));

	turnOffDialogListener(page, dialogListener);
	await page.close();
	return {
		payload,
		isSuccessful: true,
	};
}