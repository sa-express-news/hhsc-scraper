import * as _ from 'lodash';

// interfaces
import { DeficiencyHash, DeficencyPopUpHash, DeficencyHashMap } from '../interfaces';
import { Browser, Page, ElementHandle, Dialog } 				from 'puppeteer';

// modules
import { 
	getDeficencyPage,
	getDeficenciesRow,
	isNextButton,
	clickNextButton,
	getCells,
	clickElement, 
	getNarrativeLink,
	getTechnicalAssistanceGiven,
	closeNarrativeBox,
	getNarrative,
	getID,
} from '../headlessBrowserUtils';

const failedScrape = () => ({ isSuccessful: false, payload: [] });

const handleError = (payload: Array<DeficiencyHash>, err: any) => {
	console.error(err);
	return payload;	
}

const handleNarrativeError = (err: any) => {
	console.error(err);
	return { narrative: 'Error retrieving' };
}

const handleTechAssistanceError = (err: any) => {
	console.error(err);
	return { technical_assistance_given: null };
};

const defaultPayload = () => ({
	activity_date: 'None',
    non_compliance_id: null,
    standard_number_description: 'None',
    activity_type: 'None',
    standard_risk_level: 'None',
    corrected_at_inspection: null,
    corrected_date: 'None',
    date_correction_verified: 'None',
    technical_assistance_given: null,
    narrative: 'None',
});

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
	non_compliance_id: {
		func: getID,
		cellsIdx: 7,
	},
	technical_assistance_given: {
		func: () => popupContent.technical_assistance_given,
	},
	narrative: {
		func: () => popupContent.narrative,
	},
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

export const scrapeNarrativePopups = async (element: ElementHandle, page: Page, url: string) => {
	const el 				= await getNarrativeLink(element);
	const isClickSuccessful = await clickElement(el, page, url);

	if (isClickSuccessful) {
		const technicalAssistanceGiven 	= await getTechnicalAssistanceGiven(page).catch(handleTechAssistanceError);
		const narrative 				= await getNarrative(page).catch(handleNarrativeError);
		await closeNarrativeBox(page);
		return Object.assign({}, technicalAssistanceGiven, narrative);
	} else {
		return Object.assign({}, handleTechAssistanceError('Tech assist click failed!'), handleNarrativeError('Narrative click failed!'));
	}
};

export const getIncident = async (element: ElementHandle, page: Page, url: string) => {
	const cells: Array<string | number> 	= await getCells(element);
	const popupContent: DeficencyPopUpHash 	= await scrapeNarrativePopups(element, page, url);
	return await pluckValues(cells, popupContent, element);
};

export const getIncidentRow = async (rows: Array<ElementHandle>, page: Page, url: string) => {
	const incidents: Array<DeficiencyHash> = [];
	let incident: DeficiencyHash;

	for (let i = 0; i < rows.length; i++) {
		incident = await getIncident(rows[i], page, url)
		incidents.push(incident);
	}

	return incidents;
};

export const scrapeRowsFromTable = async (payload: Array<DeficiencyHash>, page: Page, url: string, rows: Array<ElementHandle>) => {
	const incidents: Array<DeficiencyHash> = await getIncidentRow(rows, page, url).catch((err) => err);
	if (!incidents) return handleError(payload, incidents);

	payload = payload.concat(incidents);

	const nextButton: boolean = await isNextButton(page);
	if (nextButton) {
		const isClickSuccessful = await clickNextButton(page, url);
		if (!isClickSuccessful) return payload;

		const nextRows: Array<ElementHandle> = await getDeficenciesRow(page);
		if (nextRows.length === 0) return payload;

		return await scrapeRowsFromTable(payload, page, url, nextRows).catch((err) => handleError(payload, err));
	} else {
		return payload;
	}
};

const getDialogListener = () => async (dialog: Dialog) => {
	console.log(`Dismissing dialog: ${dialog.message()}`);
	await dialog.dismiss();
};

const turnOnDialogListener = (page: Page, dialogListener) => page.on('dialog', dialogListener);

const turnOffDialogListener = (page: Page, dialogListner) => page.removeListener('dialog', dialogListner);

export default async (id: number, browser: Browser) => {
	const page: Page = await getDeficencyPage(getURL(id), browser);
	if (!page) return failedScrape();

	const dialogListener = getDialogListener();
	turnOnDialogListener(page, dialogListener);

	const rows: Array<ElementHandle> = await getDeficenciesRow(page);
	if (rows.length === 0) return failedScrape();

	const payload: Array<DeficiencyHash> = await scrapeRowsFromTable([], page, getURL(id), rows).catch((err) => handleError([], err));

	turnOffDialogListener(page, dialogListener);
	await page.close();
	return {
		payload: _.uniqBy(payload, 'non_compliance_id'),
		isSuccessful: true,
	};
}