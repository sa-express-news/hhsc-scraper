// interfaces
import { Browser, Page, ElementHandle } from 'puppeteer';
import { Logger } 						from 'winston';
import { AttemptedIDHandlerInstance } 	from '../interfaces';

// modules
import handleClickEvent from '../handleClickEvent';

const handleError = (err: any, logger: Logger) => {
	logger.error(err);
	return null;
}

const closeSubscriptionModal = async (page: Page) => {
	return await page.click('button.prefix-overlay-close.prefix-overlay-action-later').catch((err) => err);
};

const getPage = async (url: string, browser: Browser, logger: Logger) => {
	const page: Page = await browser.newPage();
	await page.goto(url).catch((err: any) => handleError(err, logger));
	return page;
};

const isAlertPage = async (page: Page, logger: Logger) => {
	const alert = await page.$('div.alert.alert-info').catch((err: any) => handleError(err, logger));
	return alert !== null;
};

export const getDeficencyPage = async (url: string, browser: Browser, logger: Logger) => {
	let page: Page = await getPage(url, browser, logger);
	// this whole saga helps us beat the login blocker page the HHSC attempts to throw
	let hitAlertPage = await isAlertPage(page, logger);
	while (hitAlertPage) {
		logger.info('Hit alert page!');
		await page.close();
		page = await getPage(url, browser, logger);
		hitAlertPage = await isAlertPage(page, logger);
	}
	// We need to handle the modal that pops up on page load
	await closeSubscriptionModal(page);
	return page;
};

export const getDeficenciesRow = (page: Page) => page ? page.$$('div#ctl00_contentBase_tabSections_C1 .dxgvDataRow_Glass') : [];

export const isNextButton = async (page: Page, logger: Logger) => {
	const onClickSel 	= 'ASPx.GVPagerOnClick(\'ctl00_contentBase_tabSections_gridSummary\',\'PBN\');'
	const fullSel 		= `a.dxp-button.dxp-bi[onclick="${onClickSel}"]`;
	const nextButton: any = await page.$(fullSel).catch((err: any) => handleError(err, logger));
	return nextButton !== null;
};

export const clickNextButton = async (page: Page, url: string, logger: Logger) => {
	const onClickSel 	= 'ASPx.GVPagerOnClick(\'ctl00_contentBase_tabSections_gridSummary\',\'PBN\');'
	const fullSel 		= `a.dxp-button.dxp-bi[onclick="${onClickSel}"]`;
	return await clickButtonOnPage(page, fullSel, url, logger).catch((err: any) => handleError(err, logger));
};

export const clickButtonOnPage = async (page: Page, sel: string, url: string, logger: Logger) => {
	const res = await handleClickEvent(page, url, async () => await page.click(sel).catch((err: any) => handleError(err, logger)), logger);
	return res;
};

export const getCells = (el: ElementHandle) => {
	return el.$$eval('td.dxgv', nodes => nodes.map(node => node.innerHTML.trim()));
};

export const getNarrativeLink = (el: ElementHandle) => el.$('td.dxgv a');

export const clickElement = async (el: ElementHandle, page: Page, url:string, logger: Logger) => {
	const res = await handleClickEvent(page, url, async () => await el.click().catch((err: any) => handleError(err, logger)), logger);
	return res;
};

export const closeNarrativeBox = async (page: Page, logger: Logger) => {
	return await page.click('div.dxpcLite_Glass.dxpclW div.dxpc-closeBtn a').catch((err: any) => handleError(err, logger))
};
