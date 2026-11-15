# Pharma Intelligence & Strategy Agent

1. Install dependencies using `npm install` with Node.js 22 or newer.
2. Set `GEMINI_API_KEY` in `.env.local`.
3. Run `npm run dev` and open the local address printed in the terminal.

The API key stays on the local server. Generating a report sends your query, worksheet names and column headers to Google Gemini. Use only workbooks and queries you are authorised to share. A static build does not provide the report endpoint.
