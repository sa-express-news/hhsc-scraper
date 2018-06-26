const handleError = (err: any) => {
	console.error(err);
	return null;
}

// timeout is called if listener hangs for 30+ seconds
const getTimeout = resolve => setTimeout(() => {
  	console.error('No intercepted response for 30 seconds after button click');
  	resolve(false);
}, 30000);

const clickSomething = (page, url: string, clicker: Function) => new Promise((resolve, reject) => {
	let listener;
	let timeout;

	timeout = getTimeout(resolve);
	listener = res => {
		if (res.url() === url) {
			clearTimeout(timeout);
			page.removeListener('response', listener);
			resolve(true);
		}
	};

	page.on('response', listener);
	clicker();
});

export const clickButtonOnPage = async (page, sel, url: string) => {
	return clickSomething(page, url, () => page.click(sel)).catch(handleError);
};

export const clickElement = async (el, page, url:string) => {
	return clickSomething(page, url, () => el.click()).catch(handleError);
};
