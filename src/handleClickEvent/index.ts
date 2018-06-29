// interfaces
import { Page, Response } from 'puppeteer';
import { Logger } from 'winston';

class HandleClickEvent {
	private timeout: NodeJS.Timer;
	private logger: Logger;
	public listener: any;
	public promise: any;

	constructor(page: Page, url: string, clicker: Function, logger: Logger) {
		this.promise 	= this.setPromise(page, url, clicker);
		this.logger		= logger;

	}

	private getTimeout(resolve: Function, page: Page) {
		return setTimeout(() => {
		  	this.logger.error('No intercepted response for 30 seconds after button click');
		  	page.removeListener('response', this.listener);
		  	resolve(false);
		}, 30000);
	}

	private getListener(page: Page, url: string, resolve: Function) {
		return async (res: Response) => {
			if (res.url() === url) {
				clearTimeout(this.timeout);
				await page.removeListener('response', this.listener);
				const json = await res.text();
				resolve(json);
			}
		};
	}

	public handleError(err: any, reject: Function, page: Page) {
		this.logger.error(err);
		clearTimeout(this.timeout);
		page.removeListener('response', this.listener);
		return reject(null);
	}

	public setPromise(page: Page, url: string, clicker: Function) {
		return new Promise ((resolve: Function, reject: Function) => {
			this.timeout = this.getTimeout(resolve, page);
			this.listener = this.getListener(page, url, resolve);

			page.on('response', this.listener);
			clicker();
		});
	}
}

export default (page: Page, url: string, clicker: Function, logger: Logger) => new HandleClickEvent(page, url, clicker, logger).promise;
