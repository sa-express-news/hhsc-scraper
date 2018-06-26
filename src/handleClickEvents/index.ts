const handleError = (err: any) => {
	console.error(err);
	return null;
}

export const resolveButtonClick = (timeout, resolve, url: string, page, res) => {
	if (res.url() === url) {
		clearTimeout(timeout)
		page.removeListener('response', resolveButtonClick);
		resolve(true);
	}
};

export const clickButton = async (page, target, url: string) => {
	return new Promise((resolve, reject) => {
		// timeout is called if listener hangs for 30+ seconds
		const timeout = setTimeout(() => {
	      	clearTimeout(timeout);
	      	console.error('No intercepted response for 30 seconds after button click');
	      	resolve(false);
	    }, 30000);

		page.on('response', resolveButtonClick.bind(null, timeout, resolve, url, page));
		
		if (typeof target === 'string') {
			page.click(target);
		}
		else {
			target.click();
		}

	}).catch(handleError);
};
