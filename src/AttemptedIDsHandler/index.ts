import * as _ from 'lodash';

// interfaces
import { AttemptedIDs, AttemptedIDHandlerInstance } from '../interfaces';

class AttemptedIDsHandler implements AttemptedIDHandlerInstance {
	private lastSuccessful: number;
	private lastAttempted: number;
	private rejectedDeficencies: Array<number>;
	private facilityAlert: Array<number>;

	constructor(attemptedIDs: AttemptedIDs, range: Array<number>) {
		this.lastSuccessful = attemptedIDs.last_successful;
		this.lastAttempted = attemptedIDs.last_successful;
		this.rejectedDeficencies = this.findUnattemptedIDs(attemptedIDs.facility_scraped_deficencies_rejected, range);
		this.facilityAlert = this.findUnattemptedIDs(attemptedIDs.hit_alert_page_on_facility_scrape_attempt, range);
	}

	private findUnattemptedIDs(previouslyRejected: Array<number>, range: Array<number>) {
		return _.difference(previouslyRejected, _.intersection(previouslyRejected, range));
	}

	public newAttempt(id: number) {
		if (id > this.lastAttempted) {
			this.lastAttempted = id;
		}
		return id;
	}

	public newSuccess(id: number) {
		if (id > this.lastSuccessful) {
			this.lastSuccessful = id;
		}
		return id;
	}

	public rejectedByAlert(id: number) {
		return this.facilityAlert.push(id);
	}

	public rejectedDeficency(id: number) {
		return this.rejectedDeficencies.push(id);
	}

	public ejectHash() {
		return {
			last_successful: this.lastSuccessful,
			last_attempted: this.lastAttempted,
			facility_scraped_deficencies_rejected: this.rejectedDeficencies,
			hit_alert_page_on_facility_scrape_attempt: this.facilityAlert,
		};
	}
}

export default AttemptedIDsHandler