import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
	const pages = [
		'https://openbeatz.de/en/info/',
		'https://openbeatz.de/en/lineup/',
		'https://openbeatz.de/en/schedule/',
	];

	const results = {};

	for (const url of pages) {
		try {
			const response = await fetch(url);
			const text = await response.text();
			const dom = new JSDOM(text);

			const paragraphs = [...dom.window.document.querySelectorAll('p')]
				.map(p => p.textContent.trim());

			results[url] = paragraphs;
		} catch (e) {
			results[url] = { error: e.message };
		}
	}

	res.status(200).json(results);
}
