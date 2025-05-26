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

			const structuredContent = {};
			let currentHeading = 'Intro'; // default if content appears before any heading

			// Go through elements in order to preserve flow
			const elements = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6 p span')];
			for (const el of elements) {
				const tag = el.tagName.toLowerCase();
				const text = el.textContent.trim();

				if (!text) continue;

				if (tag.startsWith('h')) {
					currentHeading = text;
					if (!structuredContent[currentHeading]) {
						structuredContent[currentHeading] = [];
					}
				} else if (tag === 'p') {
					// Filter out junk/empty text
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
