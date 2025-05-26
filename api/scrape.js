import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import Database from 'better-sqlite3';

const db = new Database('./content.db');

// Create the content table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT,
    heading TEXT,
    content TEXT,
    language TEXT,
    url TEXT
  )
`);

export default async function handler(req, res) {
	const endpoints = [
		'contact', 'info', 'festival', 'camping', 'impressum',
		'agb', 'datenschutz', 'team'
	];
	const language = 'en';
	const results = {};

	for (const endpoint of endpoints) {
		try {
			const fullURL = `https://openbeatz.de/${language}/${endpoint}`;
			const response = await fetch(fullURL);
			const html = await response.text();
			const dom = new JSDOM(html);
			const { document } = dom.window;
			const main = document.querySelector('.entry-content') || document.body;

			const structuredContent = {};
			let currentHeading = 'Intro';

			const elements = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span')];

			for (const el of elements) {
				const tag = el.tagName.toLowerCase();
				const text = el.textContent.trim();

				if (!text) continue;

				if (tag.startsWith('h')) {
					currentHeading = text
						.toLowerCase()
						.replace(/[^\w\s-]/g, '')
						.replace(/\s+/g, ' ')
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

			// Save to SQLite
			for (const [heading, paragraphs] of Object.entries(structuredContent)) {
				const joined = paragraphs.join('\n\n');
				db.prepare(`
          INSERT INTO content (endpoint, heading, content, language, url)
          VALUES (?, ?, ?, ?, ?)
        `).run(endpoint, heading, joined, language, fullURL);
			}

			results[endpoint] = structuredContent;
			console.log(`✅ Saved content from ${endpoint}`);
		} catch (error) {
			results[endpoint] = { error: error.message };
			console.error(`❌ Error on ${endpoint}: ${error.message}`);
		}
	}

	res.status(200).json({ message: 'Scraping and saving complete.', results });
}
