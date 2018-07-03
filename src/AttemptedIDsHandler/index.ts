import * as _ from 'lodash';

// interfaces
import { AttemptedIDs, AttemptedIDHandlerInstance } from '../interfaces';

class AttemptedIDsHandler implements AttemptedIDHandlerInstance {
	private lastSuccessful: number;
	private lastAttempted: number;
	private totalLastScrape: number;
	private totalInDB: number;
	private rejectedDeficencies: Array<number>;
	private rejectedFacilities: Array<number>;

	constructor(attemptedIDs: AttemptedIDs, range: Array<number>) {
		this.lastSuccessful         = attemptedIDs.last_successful;
		this.lastAttempted          = attemptedIDs.last_successful;
		this.totalLastScrape        = attemptedIDs.total_from_last_scrape;
		this.totalInDB	            = attemptedIDs.total_in_database;
		this.rejectedDeficencies    = this.findUnattemptedIDs(attemptedIDs.facility_scraped_deficencies_rejected, range);
		this.rejectedFacilities     = this.findUnattemptedIDs(attemptedIDs.facility_timeout_or_alert_page, range);
	}

	private findUnattemptedIDs(previouslyRejected: Array<number>, range: Array<number>) {
		// here we want to make sure all failed attempts from previous scrapes are added to the queue for the new scrape
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

	public rejectedFacility(id: number) {
		// something went wrong trying to scrape this facility
		return this.rejectedFacilities.push(id);
	}

	public rejectedDeficency(id: number) {
		// something went wrong attempting to scrape deficencies for this facility
		return this.rejectedDeficencies.push(id);
	}

	public setScrapeTotal(total: number) {
		return this.totalLastScrape = total;
	}

	public setDBTotal(total: number) {
		return this.totalInDB = total;
	}

	public ejectHash() {
		// return an attemptedIDs hash with the updated data
		return {
			last_successful: this.lastSuccessful,
			last_attempted: this.lastAttempted,
			total_from_last_scrape: this.totalLastScrape,
			total_in_database: this.totalInDB,
			facility_scraped_deficencies_rejected: this.rejectedDeficencies,
			facility_timeout_or_alert_page: this.rejectedFacilities,
		};
	}
}

export default AttemptedIDsHandler