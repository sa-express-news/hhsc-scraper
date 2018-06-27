require('dotenv').config();

import * as rp from 'request-promise';

// interfaces
import { AttemptedIDs, OperationHash, OperationPaths, IDsPaths } from '../interfaces';

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

const getOperations = () => rp(setOperationsConfigObj(getOperationPaths()))
				.then((res: Array<OperationHash>) => res)
				.catch((err: any) => console.error(err));

const getAttemptedIDs = () => rp(setIDsConfigObj(getIDsPaths()))
				.then((res: AttemptedIDs) => res)
				.catch((err: any) => console.error(err));

export default {
	getOperations,
	getAttemptedIDs,
};
