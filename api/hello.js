import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// api/scrape.js
export default async function handler(req, res) {
	res.status(200).json({ message: 'Hello friend!' });
}
