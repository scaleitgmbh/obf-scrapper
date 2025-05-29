import scraper from './scraper.js';

export default async function handler(req, res) {
	const endpoints = ['artists'];
	const results = scraper( endpoints );

	res.status(200).json(results);
}
