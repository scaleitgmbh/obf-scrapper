import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
	const endpoints = [
		'info',
		'festival',
		'camping',
		'impressum',
	];

	const results = {};

	for (const endpoint of endpoints) {
		try {
			const fullURL = `https://openbeatz.de/en/${endpoint}`
			const response = await fetch(fullURL);
			const html = await response.text();
			const dom = new JSDOM(html);

			const paragraphs = [...dom.window.document.querySelectorAll('p')].map(p => p.textContent.trim());

			results[endpoint] = paragraphs;
		} catch (error) {
			results[endpoint] = { error: error.message };
		}
	}

	res.status(200).json(results)
}
