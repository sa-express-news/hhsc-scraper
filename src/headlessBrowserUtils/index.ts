import { Browser, Page, ElementHandle } from 'puppeteer';

// modules
import handleClickEvent from '../handleClickEvent';

const handleError = (err: any) => {
	console.error(err);
	return null;
}

const closeSubscriptionModal = async (page: Page) => {
	return await page.click('button.prefix-overlay-close.prefix-overlay-action-later').catch((err) => console.log('No modal'));
};

const getPage = async (url: string, browser: Browser) => {
	const page: Page = await browser.newPage();
	await page.goto(url).catch(handleError);
	return page;
};

const isAlertPage = async (page: Page) => {
	const alert = await page.$('div.alert.alert-info').catch(handleError);
	return alert !== null;
};

export const getDeficencyPage = async (url: string, browser: Browser) => {
	let page: Page = await getPage(url, browser);
	// this whole saga helps us beat the login blocker page the HHSC attempts to throw
	let hitAlertPage = await isAlertPage(page);
	while (hitAlertPage) {
		console.log('Hit alert page!');
		await page.close();
		page = await getPage(url, browser);
		hitAlertPage = await isAlertPage(page);
	}
	// We need to handle the modal that pops up on page load
	await closeSubscriptionModal(page);
	return page;
};

export const getDeficenciesRow = (page: Page) => page ? page.$$('#ctl00_contentBase_tabSections_C1 .dxgvDataRow_Glass') : [];

export const isNextButton = async (page: Page) => {
	const onClickSel 	= 'ASPx.GVPagerOnClick(\'ctl00_contentBase_tabSections_gridSummary\',\'PBN\');'
	const fullSel 		= `a.dxp-button.dxp-bi[onclick="${onClickSel}"]`;
	const nextButton: any = await page.$(fullSel).catch(handleError);
	return nextButton !== null;
};

export const clickNextButton = async (page: Page, url: string) => {
	const onClickSel 	= 'ASPx.GVPagerOnClick(\'ctl00_contentBase_tabSections_gridSummary\',\'PBN\');'
	const fullSel 		= `a.dxp-button.dxp-bi[onclick="${onClickSel}"]`;
	return await clickButtonOnPage(page, fullSel, url).catch(handleError);
};

export const clickButtonOnPage = async (page: Page, sel: string, url: string) => {
	const res = await handleClickEvent(page, url, async () => await page.click(sel).catch(handleError));
	return res;
};

export const getCells = (el: ElementHandle) => {
	return el.$$eval('td.dxgv', nodes => nodes.map(node => node.innerHTML.trim()));
};

export const getNarrativeLink = (el: ElementHandle) => el.$('td.dxgv a');

export const clickElement = async (el: ElementHandle, page: Page, url:string) => {
	const res = await handleClickEvent(page, url, async () => await el.click().catch(handleError));
	return res;
};

export const sliceTechAssistanceString = node => {
	const html = node.innerHTML.trim();
	return html.slice(html.indexOf(': ') + 1).trim();
};

export const getTechnicalAssistanceGiven = async (page: Page) => {
	const sel = 'span#ctl00_contentBase_popupNarrative_ASPxLabel1';
	const value = await page.$eval(sel, sliceTechAssistanceString).catch(handleError);
	const technical_assistance_given = value === 'Yes';
	return { technical_assistance_given };
};

export const closeNarrativeBox = async (page: Page) => {
	return await page.click('div.dxpcLite_Glass.dxpclW div.dxpc-closeBtn a').catch(handleError)
};

export const getNarrative = async (page: Page) => {
	const sel = 'textarea.dxeMemoEditArea_Glass.dxeMemoEditAreaSys';
	const narrative = await page.$eval(sel, (node: HTMLTextAreaElement) => node.value.trim()).catch(handleError);
	return { narrative };
};

export const getID = async (cells, cellsIdx: number, el: ElementHandle) => {
	const onclick: string = await el.$eval('td.dxgv a', (a: HTMLLinkElement) => a.getAttribute('onclick'));
	// extract the id from the arguments of the function
	return parseInt(onclick.match(/\d+/)[0], 10);
};
