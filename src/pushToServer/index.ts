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

const setPOSTConfigObj = (filename: string, dir: string, extension: string, contentType: string) => ({
	method: 'POST',
	uri: `https://api.data.world/v0/uploads/expressnews/dfps-cpainvestigations-data/files?expandArchives=false`,
	formData: {
		file: {
			name: filename,
			value: fs.createReadStream(`./${dir}/${filename}.${extension}`),
			options: {
				filename: `./${filename}.${extension}`,
				contentType: contentType,
			},
		}, 
	},
	headers: {
		'Authorization': `Bearer ${apiKey}`,
	},
});

const pushSyncedData = (filename: string, dir: string, extension: string, contentType: string) => rp(setPOSTConfigObj(filename, dir, extension, contentType));

/*
 * Generate a CSV file from the array of objects and push it to data.world
 */

const setStringifyOptions = () => ({
	header: true,
	formatters: {
		bool: bool => bool ? '1' : '0',
	},
});

const saveCSV = async (data: Array<OperationHash>, filename: string) => new Promise((resolve, reject) => {
	csv.stringify(data, setStringifyOptions(), (err, output) => {
		if (err) reject(err);
		fs.writeFile(`./results/${filename}.csv`, output, async error => {
			if (error) reject(error);
			else {
				console.log(`Pushing ${filename} to data.world`);
				pushSyncedData(filename, 'results', 'csv', 'text/csv').then(resolve).catch(reject);
			}
		});
	})
}).catch(handleError);

const saveJSON = async (data: AttemptedIDs, filename: string) => new Promise((resolve, reject) => {
	const json = JSON.stringify(data);
	fs.writeFile(`./logs/${filename}.json`, json, 'utf8', (err: any) => {
		if (err) reject(err);
		else {
			console.log(`Pushing ${filename} to data.world`);
			pushSyncedData(filename, 'logs', 'json', 'json').then(resolve).catch(reject);
		}
	});
}).catch(handleError);

export default async (operations: Array<OperationHash>, operationsBackup: Array<OperationHash>, attemptedIDs: AttemptedIDs) => {
	await saveCSV(operations, 'hhsc-deficency-data');
	await saveCSV(operationsBackup, 'backup-hhsc-deficency-data');
	await saveJSON(attemptedIDs, 'attempted-ids');
};
