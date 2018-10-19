require('dotenv').config();

import * as rp from 'request-promise';

// interfaces
import { AttemptedIDs, OperationHash, OperationPaths, IDsPaths } from '../interfaces';
import { Logger } from 'winston';

const apiKey = process.env.DW_API_KEY;

const getSQLQuery = (sheet: string) => encodeURIComponent(`SELECT * FROM ${sheet} ORDER BY ${sheet}.operation_id ASC`);

const getOperationPaths = () => ({
	dataset: 'dfps-cpainvestigations-data',
	sqlQuery: getSQLQuery('hhsc_deficency_data'),
});

const getIDsPaths = () => ({
	dataset: 'dfps-cpainvestigations-data',
	file: 'attempted-ids.json',
});

const setIDsConfigObj = (paths: IDsPaths) => ({
	uri: `https://api.data.world/v0/file_download/expressnews/${paths.dataset}/${paths.file}`,
	headers: {
		'Authorization': `Bearer ${apiKey}`,
		'Accept': 'application/json',
	},
	json: true,
});

const setOperationsConfigObj = (paths: OperationPaths) => ({
	uri: `https://api.data.world/v0/sql/expressnews/${paths.dataset}?query=${paths.sqlQuery}`,
	headers: {
		'Authorization': `Bearer ${apiKey}`,
		'Accept': 'application/json',
	},
	json: true,
});

const getOperations = (logger: Logger) => rp(setOperationsConfigObj(getOperationPaths()))
				.then((res: Array<OperationHash>) => res)
				.catch((err: any) => {
					if (err && err.statusCode && err.statusCode === 400) {
						logger.error('Data file not found on server. If this is the first time the scraper has run or no data has been found yet, don\'t worry about it.');
					} else {
						logger.error(err);
					}
					return [];
				});

const getAttemptedIDs = (logger: Logger) => rp(setIDsConfigObj(getIDsPaths()))
				.then((res: string) => {
					return JSON.parse(JSON.stringify(res)); // file is not JSON in response but an obj string, so we stingify before parsing
				})
				.catch((err: any) => {
					if (err && err.statusCode && err.statusCode === 404) {
						logger.error('AttemptedIDs not found on server. If this is the first time the scraper has run, don\'t worry about it.');
					} else {
						logger.error(err);
					}
					return {
				        last_successful: 0,
				        last_attempted: 0,
				        total_from_last_scrape: 0,
				        total_in_database: 0,
				        facility_scraped_deficencies_rejected: [],
				        facility_timeout_or_alert_page: [],
				    };
				});

export default {
	getOperations,
	getAttemptedIDs,
};
