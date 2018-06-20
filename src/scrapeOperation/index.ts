import * as _ from 'lodash';

// interfaces
import { 
	FacilityHash,
	DeficiencyHash,
	OperationHash,
} from '../interfaces';

// models
import scrapeFacilityDetails 	from '../scrapeFacilityDetails';
import scrapeDeficiencyDetails 	from '../scrapeDeficiencyDetails';

export const catchError = (err: any) => {
	console.error(err);
	return false;
}

export const mergeResults = (hashes) => {
	let facilityHash: FacilityHash;
	let deficiencies: Array<DeficiencyHash>;

	if (hashes.length !== 2) return false;

	for (let i = 0; i < hashes.length; i++) {
		if (!hashes[i].isSuccessful) {
			return false;
		}

		if (hashes[i].responseType === 'deficiencies') {
			deficiencies = hashes[i].payload;
		} else {
			facilityHash = hashes[i].payload;
		}
	}
	
	return deficiencies.map((row: DeficiencyHash) => {
		return Object.assign({}, row, facilityHash);
	});
};

export const sendScrapers = (id: number) => Promise.all([scrapeFacilityDetails(id), scrapeDeficiencyDetails(id)]).then(mergeResults).catch(catchError);

export default async (result: Array<OperationHash>, id: number) => {
	const operationArray: any = await sendScrapers(id);
	return operationArray ? result.concat(operationArray) : result;
}