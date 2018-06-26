import { Page, Response } from 'puppeteer';

class HandleClickEvent {
	private timeout: NodeJS.Timer;
	public listener: any;
	public promise: any;

	constructor(page: Page, url: string, clicker: Function) {
		this.promise = this.setPromise(page, url, clicker);
	}

	private getTimeout(resolve: Function, page: Page) {
		return setTimeout(() => {
		  	console.error('No intercepted response for 30 seconds after button click');
		  	page.removeListener('response', this.listener);
		  	resolve(false);
		}, 30000);
	}

	private getListener(page: Page, url: string, clicket: Function, resolve: Function) {
		return (res: Response) => {
			if (res.url() === url) {
				clearTimeout(this.timeout);
				page.removeListener('response', this.listener);
				resolve(true);
			}
		};
	}

	public setPromise(page: Page, url: string, clicker: Function) {
		return new Promise ((resolve: Function, reject: Function) => {
			this.timeout = this.getTimeout(resolve, page);
			this.listener = this.getListener(page, url, clicker, resolve);

			page.on('response', this.listener);
			clicker();
		});
	}
}

export default (page: Page, url: string, clicker: Function) => new HandleClickEvent(page, url, clicker).promise;
