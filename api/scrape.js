import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
	const endpoints = ['info', 'festival', 'camping', 'impressum'];
	const results = {};

	for (const endpoint of endpoints) {
		try {
			const fullURL = `https://openbeatz.de/en/${endpoint}`;
			const response = await fetch(fullURL);
			const html = await response.text();
			const dom = new JSDOM(html);
			const { document } = dom.window;

			const main = document.querySelector('main') || document.body;

			const paragraphs = [...main.querySelectorAll('p')]
				.map(p => p.textContent.trim())
				.filter(text => text.length > 5 && /[a-zA-Z0-9]/.test(text));

			const headings = [...main.querySelectorAll('h1, h2, h3, h4')]
				.map(h => h.textContent.trim())
				.filter(text => text.length > 0);

			results[endpoint] = {
				headings,
				paragraphs,
			};
		} catch (error) {
			results[endpoint] = { error: error.message };
		}
	}

	res.status(200).json(results);
}
