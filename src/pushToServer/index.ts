require('dotenv').config();

import * as rp from 'request-promise';
import * as fs from 'fs';
import * as csv from 'csv';

// interfaces
import { OperationHash, AttemptedIDs } from '../interfaces';

const apiKey = process.env.DW_API_KEY;

const handleError = (err: any) => console.error(err);

/*
 * Push the outpus CSV to data.world
 */

const setPOSTConfigObj = (filename: string, extension: string) => ({
	method: 'POST',
	uri: `https://api.data.world/v0/uploads/expressnews/dfps-cpainvestigations-data/files?expandArchives=false`,
	formData: {
		file: {
			name: filename,
			value: fs.createReadStream(`./results/${filename}.csv`),
			options: {
				filename: `./${filename}.csv`,
				contentType: 'text/csv',
			},
		}, 
	},
	headers: {
		'Authorization': `Bearer ${apiKey}`,
	},
});

const pushSyncedData = (filename: string, extension: string) => rp(setPOSTConfigObj(filename, extension));

/*
 * Generate a CSV file from the array of objects and push it to data.world
 */

 const setStringifyOptions = () => ({
 	header: true,
 	formatters: {
 		bool: bool => bool ? '1' : '0',
 	},
 });

 c

const saveCSV = async => (data: Array<OperationHash>, filename: string) => {
	return new Promise((resolve, reject) => {
		csv.stringify(data, setStringifyOptions(), async (err, output) => {
			if (err) console.error(err);
			else {
				console.log(`Pushing ${filename} to data.world`);
				await pushSyncedData(filename, 'csv').catch(handleError);
				resolve();
			}
		})
	}).catch(handleError);
};

export default async (operations: Array<OperationHash>, operationsBackup: Array<OperationHash>, attemptedIDs: AttemptedIDs) => {
	await saveCSV(operations, 'hhsc-deficency-data');
	await saveCSV(operationsBackup, 'backup-hhsc-deficency-data');
	await saveJSON(attemptedIDs, 'attempted-ids');

	csv.stringify(master, setStringifyOptions(), (err, output) => {
		if (err) console.error(err);
		fs.writeFile(`./results/${filename}.csv`, output, async error => {
			if (error) console.error(error);
			else {
				console.log('Pushing to data.world');
				await pushSyncedData(filename, dataset).catch(err => console.error(err));
			};
		});
	});
};