import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
	const pages = [
		'https://openbeatz.de/en/info/',
		'https://openbeatz.de/en/lineup/',
		'https://openbeatz.de/en/schedule/',
		'https://openbeatz.de/en/contact/',
		'https://openbeatz.de/en/tickets/'
	];

	const results = {};

	for (const url of pages) {
		try {
			const response = await fetch(url);
			const html = await response.text();
			const dom = new JSDOM(html);

			const paragraphs = [...dom.window.document.querySelectorAll('p')].map(p => p.textContent.trim());

			results[url] = paragraphs;
		} catch (error) {
			results[url] = { error: error.message };
		}
	}

	res.status(200).json(results);
}
