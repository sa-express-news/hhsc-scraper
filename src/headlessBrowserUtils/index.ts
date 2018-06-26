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

export const getDeficencyPage = async (url: string, browser: Browser) => {
	const page: Page = await browser.newPage();
	await page.goto(url).catch(handleError);
	// We need to handle the modal that pops up on page load
	await closeSubscriptionModal(page);
	return page;
};

export const getDeficenciesRow = (page: Page) => page ? page.$$('#ctl00_contentBase_tabSections_C1 .dxgvDataRow_Glass') : [];

export const findDeadButton = async (page: Page) => {
	const deadButtons: any = await page.$$eval('b.dxp-button.dxp-bi.dxp-disabledButton', nodes => nodes.map(node => node.innerHTML.trim())).catch(() => []);
	const deadNextButton = deadButtons.filter(btn => btn.indexOf('<img src="../../App_Themes/Office2003%20Blue/Web/pNextDisabled.png" alt="Next">') !== -1);
	return deadNextButton.length === 1;
};

export const clickNextButton = async (page: Page, url: string) => {
	const onClickSel 	= 'ASPx.GVPagerOnClick(\'ctl00_contentBase_tabSections_gridSummary\',\'PBN\');'
	const fullSel 		= `a.dxp-button.dxp-bi[onclick="${onClickSel}"]`;
	return clickButtonOnPage(page, fullSel, url);
};

export const clickButtonOnPage = async (page: Page, sel: string, url: string) => {
	return handleClickEvent(page, url, () => page.click(sel)).catch(handleError);
};

export const getCells = (el: ElementHandle) => {
	return el.$$eval('td.dxgv', nodes => nodes.map(node => node.innerHTML.trim()));
};

export const getNarrativeLink = (el: ElementHandle) => el.$('td.dxgv a');

export const clickElement = async (el: ElementHandle, page: Page, url:string) => {
	return handleClickEvent(page, url, () => el.click()).catch(handleError);
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
