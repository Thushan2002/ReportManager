# Manager AI Assistant

The manager assistant is a server-side, report-grounded Gemini integration.

## Approach

- `POST /api/manager-chat` is protected by authentication and the manager role.
- The server loads the latest 60 reports, including projects, owners, tasks, blockers, achievements, planned work, hours, notes, and statuses.
- Only a bounded digest is sent to Gemini. The API key never reaches the browser.
- The prompt tells Gemini to treat report text as untrusted data, answer only from the digest, avoid invented metrics, and say when the data is insufficient.
- The client provides a compact chat widget in the manager application shell.

## Configuration

Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. `GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`.

## Privacy

Report content is sent to Google Gemini to answer manager questions. Do not place secrets, passwords, access tokens, or unnecessary personal data in reports. The server sends only the fields needed for team reporting, limits the number of reports, and does not expose the API key to clients. Review Google Gemini data-processing and retention terms before using this feature with production or regulated data.
