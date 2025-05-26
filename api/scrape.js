import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
	const endpoints = [ 'contact', 'info', 'artists', 'festival', 'camping', 'impressum', 'agb', 'datenschutz', 'presse', 'partner', 'team', 'bewerbungen' ];
	const results = {};

	for (const endpoint of endpoints) {
		try {
			const fullURL = `https://openbeatz.de/${endpoint}`;
			const response = await fetch(fullURL);
			const html = await response.text();
			const dom = new JSDOM(html);
			const { document } = dom.window;
			const main = document.querySelector('.entry-content') || document.body;

			const structuredContent = {};
			let currentHeading = 'Intro';

			// Elements to scan through
			const elements = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span')];

			for (const el of elements) {
				const tag = el.tagName.toLowerCase();
				const text = el.textContent.trim();

				if (!text) continue;

				if (tag.startsWith('h')) {
					// Title-case the heading (e.g., "camping rules" => "Camping Rules")
					currentHeading = text
						.toLowerCase()
						.replace(/[^\w\s-]/g, '') // remove special chars
						.replace(/\s+/g, ' ') // normalize whitespace
						.trim()
						.split(' ')
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ');

					if (!structuredContent[currentHeading]) {
						structuredContent[currentHeading] = [];
					}
				} else if (tag === 'p' || tag === 'span') {
					if (text.length > 5 && /[a-zA-Z0-9]/.test(text)) {
						if (!structuredContent[currentHeading]) {
							structuredContent[currentHeading] = [];
						}
						structuredContent[currentHeading].push(text);
					}
				}
			}

			results[endpoint] = structuredContent;
		} catch (error) {
			results[endpoint] = { error: error.message };
		}
	}

	res.status(200).json(results);
}
