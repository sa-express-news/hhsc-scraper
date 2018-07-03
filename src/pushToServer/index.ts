require('dotenv').config();

import * as rp from 'request-promise';
import * as fs from 'fs';
import * as csv from 'csv';

// interfaces
import { OperationHash, AttemptedIDs, APIConfig, ParsedArgumentsPayload } 	from '../interfaces';
import { Logger } 									from 'winston';

const apiKey = process.env.DW_API_KEY;

const handleError = (err: any, logger: Logger) => logger.error(err);

// Config our POST request for data.world API
const setPOSTConfigObj = (apiConfig: APIConfig) => {
	const { filename, dir, ext, contentType } = apiConfig;
	return {
		method: 'POST',
		uri: `https://api.data.world/v0/uploads/expressnews/dfps-cpainvestigations-data/files?expandArchives=false`,
		formData: {
			file: {
				name: filename,
				value: fs.createReadStream(`./${dir}/${filename}.${ext}`),
				options: {
					filename: `./${filename}.${ext}`,
					contentType,
				},
			}, 
		},
		headers: {
			'Authorization': `Bearer ${apiKey}`,
		},
	}
};

const pushSyncedData = (apiConfig: APIConfig) => rp(setPOSTConfigObj(apiConfig));

// data.world gets grumpy when it recieves true or false
const setStringifyOptions = () => ({
	header: true,
	formatters: {
		'bool': bool => bool ? '1' : '0',
	}
});

// push the new data and the backup to the server and save it to /results
const saveCSV = async (data: Array<OperationHash>, filename: string, logger: Logger) => new Promise((resolve, reject) => {
	csv.stringify(data, setStringifyOptions(), (err, output) => {
		if (err) reject(err);
		fs.writeFile(`./results/${filename}.csv`, output, async error => {
			if (error) reject(error);
			else {
				logger.info(`Pushing ${filename} to data.world`);
				pushSyncedData({
					filename,
					dir: 'results',
					ext: 'csv',
					contentType: 'text/csv'
				}).then(resolve).catch(reject);
			}
		});
	});
}).catch((err: any) => handleError(err, logger));

// used to store the temporary DB contents in /temp. Does not get pushed to server
const saveTemp = async (data: Array<OperationHash>, filename: string, logger: Logger) => new Promise((resolve, reject) => {
	csv.stringify(data, setStringifyOptions(), (err, output) => {
		if (err) reject(err);
		fs.writeFile(`./temp/${filename}.csv`, output, async error => {
			if (error) reject(error);
			else {
				logger.info(`${filename} saved to /temp`);
				resolve(output);
			}
		});
	});
}).catch((err: any) => handleError(err, logger));

// used to push attemptedIDs to the server and to /logs
const saveJSON = async (data: AttemptedIDs, filename: string, logger: Logger) => new Promise((resolve, reject) => {
	const json = JSON.stringify(data);
	fs.writeFile(`./logs/${filename}.json`, json, 'utf8', (err: any) => {
		if (err) reject(err);
		else {
			logger.info(`Pushing ${filename} to data.world`);
			pushSyncedData({
				filename,
				dir: 'logs',
				ext: 'json',
				contentType: 'application/json'
			}).then(resolve).catch(reject);
		}
	});
}).catch((err: any) => handleError(err, logger));

export default async (operations: Array<OperationHash>, operationsBackup: Array<OperationHash>, bashArgs: ParsedArgumentsPayload, attemptedIDs: AttemptedIDs, logger: Logger) => {
	await saveCSV(operations, 'hhsc-deficency-data', logger);
	await saveCSV(operationsBackup, 'backup-hhsc-deficency-data', logger);
	if (bashArgs.batchidx) {
		await saveTemp(operationsBackup, `hhsc-deficency-data-${bashArgs.batchidx}`, logger);
	}
	await saveJSON(attemptedIDs, 'attempted-ids', logger);
};
