import requestFacilityDetailsPage from '../requestFacilityDetailsPage';

import { FacilityResponse, FacilityHash, FacilityHashMap } from '../interfaces';

const failedScrape = () => ({ isSuccessful: false });

const defaultPayload = () => ({
	operation_id: null,
	operation_number: 'None',
    operation_type: 'None',
    operation_name: 'None',
    programs_provided: 'None',
    location_address: 'None',
    phone: 'None',
    county: 'None',
    website: 'None',
    email: 'None',
    type_of_issuance: 'None',
    issuance_date: 'None',
    open_foster_homes: null,
    open_branch_offices: null,
    corrective_action: null,
    adverse_action: null,
    temporarily_closed: null,
    num_deficiencies_cited: null,
});

export const isCPA = (operationType: string) => {
	return operationType === 'Child Placing Agency-Adoption Services';
};

export const isGRO = (operationType: string) => {
	return operationType === 'General Residential Operation';
};

export const isTargetFacility = (operationType: string, numDeficiencies: number) => {
	return (isCPA(operationType) || isGRO(operationType)) && Number.isInteger(numDeficiencies) && numDeficiencies > 0;
};

export const getKey = ($: CheerioSelector, sel: string, parent: string) => $(sel, parent);

export const getValue = ($key: Cheerio) => $key.parent().next().children('font').text().trim();

export const getBoolean = ($: CheerioSelector, sel: string) => {
	const $key: Cheerio = getKey($, sel, 'td');
	const val: string = getValue($key);
	if (typeof val === 'string' && val.length > 0) {
		return val !== 'No';
	} else {
		return null;
	}
};

export const getString = ($: CheerioSelector, sel: string) => {
	const $key: Cheerio = getKey($, sel, 'td');
	const val: string = getValue($key);
	return typeof val === 'string' && val.length > 0 ? val : 'None';
};

export const getNumber = ($: CheerioSelector, sel: string) => {
	const $key: Cheerio = getKey($, sel, 'td');
	const val: number = parseInt(getValue($key), 10);
	return Number.isInteger(val) ? val : null;
};

export const getCPANumber = (operationType: string, $: CheerioSelector, sel: string) => isCPA(operationType) ? getNumber($, sel) : 0;

export const getPrograms = (operationType: string, $: CheerioSelector, sel: string) => isCPA(operationType) ? 'Child Placing Agency' : getString($, sel);

export const getAddress = ($: CheerioSelector, sel: string) => getString($, sel).replace(/\s\s+/g, ' ');

export const getNumDeficiencies = (id: number, $: CheerioSelector) => {
	const href = `/Child_Care/Search_Texas_Child_Care/CCLNET/Source/Provider/ppComplianceHistory.aspx?fid=${id}&tab=2`
	return parseInt($(`a[href="${href}"]`).html(), 10);
};

export const getOperationType = ($: CheerioSelector) => {
	const $key = getKey($, 'font:contains("Operation Type:")', 'td');
	return $key.length !== 1 ? 'Unknown' : getValue($key);
}

export const getKeysMap = (operationID: number, operationType: string, numDeficencies: number) => ({
	'operation_id': { sel: 'None', func: () => operationID },
	'operation_number': { sel: 'font:contains("Operation Number:")', func: getString },
	'operation_type': { sel: 'font:contains("Operation Type:")', func: () => operationType },
	'operation_name': { sel: 'font:contains("Operation/Caregiver Name:")', func: getString },
	'programs_provided': { sel: 'font:contains("Program Provided:")', func: getPrograms.bind(null, operationType) },
	'location_address': { sel: 'font:contains("Location Address:")', func: getAddress },
	'phone': { sel: 'font:contains("Phone Number:")', func: getString },
	'county': { sel: 'font:contains("County:")', func: getString },
	'website': { sel: 'font:contains("Website Address:")', func: getString },
	'email': { sel: 'font:contains("Email Address:")', func: getString },
	'type_of_issuance': { sel: 'font:contains("Type of Issuance:")', func: getString },
	'issuance_date': { sel: 'font:contains("Issuance Date:")', func: getString },
	'open_foster_homes': { sel: 'font:contains("Open Foster Homes:")', func: getCPANumber.bind(null, operationType) },
	'open_branch_offices': { sel: 'font:contains("Open Branch Offices:")', func: getCPANumber.bind(null, operationType) },
	'corrective_action': { sel: 'font:contains("Corrective Action:")', func: getBoolean },
	'adverse_action': { sel: 'font:contains("Adverse Action:")', func: getBoolean },
	'temporarily_closed': { sel: 'font:contains("Temporarily Closed:")', func: getBoolean },
	'num_deficiencies_cited': { sel: 'None', func: () => numDeficencies },
});

export const buildFacilityHash = (keysMap: FacilityHashMap, $: CheerioSelector) => {
	const result: FacilityHash = defaultPayload();
	for (let key in keysMap) {
		if (keysMap.hasOwnProperty(key)) {
			result[key] = keysMap[key].func($, keysMap[key].sel);
		}
	}
	return result;
}

export default async (id: number) => {
	const $: CheerioSelector = await requestFacilityDetailsPage(id);
	if (!$) { return failedScrape(); }

	const numDeficiencies: number 	= getNumDeficiencies(id, $);
	const operationType: string 	= getOperationType($);
	if (!isTargetFacility(operationType, numDeficiencies)) { return failedScrape(); }

	const payload: FacilityHash = buildFacilityHash(getKeysMap(id, operationType, numDeficiencies), $);

	return { isSuccessful: true, payload };
};
