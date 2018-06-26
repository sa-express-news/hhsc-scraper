let timeoutArr = [];
let listenerArr = [];

let idx = 0;

const handleError = (err: any) => {
	console.error(err);
	return null;
}

// timeout is called if listener hangs for 30+ seconds
const getTimeout = (resolve, idx) => setTimeout(() => {
  	clearTimeout(timeoutArr[idx]);
  	console.error('No intercepted response for 30 seconds after button click');
  	resolve(false);
}, 30000);

export const resolveButtonClick = (idx: number, resolve, url: string, page, res) => {
	if (res.url() === url) {
		clearTimeout(timeoutArr[idx]);
		page.removeListener('response', listenerArr[idx]);
		resolve(true);
	}
};

export const clickSomething = async (page, url: string, clickCB: Function) => {
	return new Promise(async (resolve, reject) => {
		timeoutArr[idx] = getTimeout(resolve, idx);
		listenerArr[idx] = resolveButtonClick.bind(null, idx, resolve, url, page)
		page.on('response', listenerArr[idx]);
		await clickCB();
		idx++;
	}).catch(handleError);
};

export const clickButtonOnPage = async (page, sel, url: string) => {
	return await clickSomething(page, url, async () => await page.click(sel));
};

export const clickElement = async (el, page, url:string) => {
	return await clickSomething(page, url, async () => await el.click());
};
