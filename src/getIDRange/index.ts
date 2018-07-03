import * as _ from 'lodash';

// interfaces
import { 
    ParsedArgumentsPayload,
    AttemptedIDs,
    IDRange
} from '../interfaces';

const defaultPayload: IDRange = {
    range: [],
    throttle: null,
};

export const getThrottle = (payload: ParsedArgumentsPayload, defaultThrottle: number) => payload.throttle ? payload.throttle : defaultThrottle;

export const getScope = (payload: ParsedArgumentsPayload, defaultScope: number) => payload.scope ? payload.scope : defaultScope;

export const getFinish = (payload: ParsedArgumentsPayload, scope: number) => payload.finish ? payload.finish : payload.start + scope;

export const spreadRange = (start: number, finish: number) => _.range(start, finish);

export const stackFailedAttempts = (attemptedIds: AttemptedIDs) => attemptedIds.facility_scraped_deficencies_rejected.concat(attemptedIds.facility_timeout_or_alert_page);

export const buildRange = (attemptedIds: AttemptedIDs, scope: number) => {
	const start: number 				= attemptedIds.last_attempted + 1;
	const toReattempt: Array<number> 	= stackFailedAttempts(attemptedIds);
	const finish: number 				= start + (scope - toReattempt.length);
	return toReattempt.concat(spreadRange(start, finish));
};

export default (payload: ParsedArgumentsPayload, attemptedIDs: AttemptedIDs, defaultScope: number, defaultThrottle: number) => {
	// This is the amount of IDs to scrape simultaneously. Be wary of overloading the HHSC website
	const throttle: number 	= getThrottle(payload, defaultThrottle);
	// The total amount of IDs to attempt to scrape in each round
	const scope: number		= getScope(payload, defaultScope);

	// if an array of specific IDs was passed to the scraper, just return that
	if (payload.specific) {
		return {
            range: payload.specific,
            throttle,
		}
	}

	// if a start ID was provided, look for a finish, failing that, use scope var
	if (payload.start) {
		const finish: number = getFinish(payload, scope);
		return {
            range: spreadRange(payload.start, finish),
            throttle,
		}
	}

	// if running the scraper w/ specific ranges, use the attemptedIDs log to figure out where to start scraping
	return {
        range: buildRange(attemptedIDs, scope),
        throttle,
	}
}