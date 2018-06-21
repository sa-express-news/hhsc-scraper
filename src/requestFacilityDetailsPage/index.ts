import * as rp 		from 'request-promise';
import * as cheerio from 'cheerio';

const setConfigObj = (id: number) => ({
	uri: `http://www.dfps.state.tx.us/child_care/search_texas_child_care/ppFacilityDetails.asp?ptype=RC&fid=${id}`,
});

const handleError = (err: any) => {
	console.error(err);
	return null;
};

export const readPage = (html: string) => cheerio.load(html);

export const getPage = (id: number) => rp(setConfigObj(id))
				.catch((err: any) => console.error(err));

export default async (id: number) => await getPage(id).then(readPage).catch(handleError);
