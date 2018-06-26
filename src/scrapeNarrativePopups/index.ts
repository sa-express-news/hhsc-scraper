import { clickElement } from '../handleClickEvents';

const handleError = (err: any) => {
	console.error(err);
	return null;
};

export const sliceTechAssistanceString = node => {
	const html = node.innerHTML.trim();
	return html.slice(html.indexOf(': ') + 1).trim();
};

export const getTechnicalAssistanceGiven = async page => {
	const sel = 'span#ctl00_contentBase_popupNarrative_ASPxLabel1';
	const value = await page.$eval(sel, sliceTechAssistanceString).catch(handleError);
	const technical_assistance_given = value === 'Yes';
	return { technical_assistance_given };
};

export const getNarrative = async page => {
	const sel = 'textarea.dxeMemoEditArea_Glass.dxeMemoEditAreaSys';
	const narrative = await page.$eval(sel, node => node.value.trim()).catch(handleError);
	return { narrative };
};

export default async (elementHandle, page, url: string) => {
	const el 				= await elementHandle.$('.dxgv a');
	console.log('ping')
	const isClickSuccessful = await clickElement(el, page, url);

	if (isClickSuccessful) {
		const technicalAssistanceGiven 	= await getTechnicalAssistanceGiven(page).catch(handleError);
		const narrative 				= await getNarrative(page).catch(handleError);
		return Object.assign({}, technicalAssistanceGiven, narrative);
	} else {
		return handleError('Click failed!');
	}
};