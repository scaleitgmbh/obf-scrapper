import scraper from './scraper.js';

export default async function handler(req, res) {
	const endpoints = [ 'contact', 'info', 'festival', 'camping', 'impressum', 'agb', 'datenschutz', 'team' ];
	const results = scraper( endpoints );

	res.status(200).json(results);
}
