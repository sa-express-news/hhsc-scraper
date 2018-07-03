import * as _ from 'lodash';

// interfaces
import { 
	FacilityHash,
	FacilityResponse,
	DeficiencyHash,
	DeficiencyResponse,
	AttemptedIDHandlerInstance
}                               from '../interfaces';
import { Browser }              from 'puppeteer';
import { Logger }               from 'winston';

// models
import scrapeFacilityDetails    from '../scrapeFacilityDetails';
import scrapeDeficiencyDetails  from '../scrapeDeficiencyDetails';

const handleError = (err: any, logger: Logger) => {
	logger.error(err)
	return { isSuccessful: false };
}

// here we create an array with a value for each deficiency and we append the facility information to each of those values
export const mergeResponses = (deficiencies: Array<DeficiencyHash>, facility: FacilityHash) => {
	return deficiencies.map((deficiency: DeficiencyHash) => Object.assign({}, facility, deficiency));
};

export default async (id: number, browser: Browser, attemptedIDsHandler: AttemptedIDHandlerInstance, logger: Logger) => {
	attemptedIDsHandler.newAttempt(id);

	const facilityResponse: FacilityResponse = await scrapeFacilityDetails(id, attemptedIDsHandler, logger).catch((err: any) => handleError(err, logger));
	// only look for deficencies if a facility was found
	if (facilityResponse.isSuccessful) {
		logger.info(`Found facility at: ${id}`);
		const deficiencyResponse: DeficiencyResponse = await scrapeDeficiencyDetails(id, browser, logger);
		if (deficiencyResponse.isSuccessful) {
			attemptedIDsHandler.newSuccess(id);
			return mergeResponses(deficiencyResponse.payload, facilityResponse.payload);
		} else {
			attemptedIDsHandler.rejectedDeficency(id);
			return [];
		}
	} else {
		return [];
	}
}