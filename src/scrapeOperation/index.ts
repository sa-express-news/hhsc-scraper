import * as _ from 'lodash';

// interfaces
import { 
	FacilityHash,
	FacilityResponse,
	DeficiencyHash,
	DeficiencyResponse,
} from '../interfaces';

// models
import scrapeFacilityDetails 	from '../scrapeFacilityDetails';
import scrapeDeficiencyDetails 	from '../scrapeDeficiencyDetails';

const handleError = (err: any) => {
	console.error(err)
	return { isSuccessful: false };
}

export const mergeResponses = (deficiencies: Array<DeficiencyHash>, facility: FacilityHash) => {
	return deficiencies.map((deficiency: DeficiencyHash) => Object.assign({}, deficiency, facility));
};

export default async (id: number) => {
	const facilityResponse: FacilityResponse = await scrapeFacilityDetails(id).catch(handleError);
	if (facilityResponse.isSuccessful) {
		const deficiencyResponse: DeficiencyResponse = await scrapeDeficiencyDetails(id);
		return deficiencyResponse.isSuccessful ? mergeResponses(deficiencyResponse.payload, facilityResponse.payload) : [];
	} else {
		return [];
	}
}