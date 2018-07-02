import * as rp 		from 'request-promise';
import * as cheerio from 'cheerio';

// interfaces
import { Logger } from 'winston';

const setConfigObj = (id: number) => ({
	uri: `http://www.dfps.state.tx.us/child_care/search_texas_child_care/ppFacilityDetails.asp?ptype=RC&fid=${id}`,
	timeout: 30000,
});

const handleError = (err: any, logger: Logger) => {
	logger.error(err);
	return null;
};

export const readPage = (html: string) => cheerio.load(html);

export const getPage = (id: number, logger: Logger) => rp(setConfigObj(id))
				.catch((err: any) => logger.error(err));

export default async (id: number, logger: Logger) => await getPage(id, logger).then(readPage).catch((err: any) => handleError(err, logger));
