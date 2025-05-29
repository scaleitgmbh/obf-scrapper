export default async function handler(req, res) {
	const fullURL = `https://openbeatz.de/info`;
	const response = await fetch(fullURL);
	const html = await response.text();
	const dom = new JSDOM(html);
	const { document } = dom.window;
	const main = document.querySelector('.header') || document.body;

	const structuredContent = {};

	// Elements to scan through
	const elements = [...main.querySelectorAll('li a')];

	for (const el of elements) {
		const link = el.getAttribute('href');
		const text = el.textContent.trim();

		if (!text) continue;

		structuredContent[text] = link;
	}

	results[endpoint] = structuredContent;

	res.status(200).json(results);
}
