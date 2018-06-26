import * as _ from 'lodash';

// interfaces
import { 
	FacilityHash,
	FacilityResponse,
	DeficiencyHash,
	DeficiencyResponse,
} from '../interfaces';
import { Browser } from 'puppeteer';

// models
import scrapeFacilityDetails 	from '../scrapeFacilityDetails';
import scrapeDeficiencyDetails 	from '../scrapeDeficiencyDetails';

const handleError = (err: any) => {
	console.error(err)
	return { isSuccessful: false };
}

// here we create an array with a value for each deficiency and we append the facility information to each of those values
export const mergeResponses = (deficiencies: Array<DeficiencyHash>, facility: FacilityHash) => {
	return deficiencies.map((deficiency: DeficiencyHash) => Object.assign({}, deficiency, facility));
};

export default async (id: number, browser: Browser) => {
	const facilityResponse: FacilityResponse = await scrapeFacilityDetails(id).catch(handleError);
	if (facilityResponse.isSuccessful) {
		const deficiencyResponse: DeficiencyResponse = await scrapeDeficiencyDetails(id, browser);
		return deficiencyResponse.isSuccessful ? mergeResponses(deficiencyResponse.payload, facilityResponse.payload) : [];
	} else {
		return [];
	}
}