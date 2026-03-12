Build a small, clean web app that connects to my Cal.com account through the **Cal.com API v2** and displays my **available time slots as plain text**. The app must use the **GET `/v2/slots`** endpoint with **Bearer authentication** and include the required **`cal-api-version`** header. Available slots can be queried by **`eventTypeId`** or by **`eventTypeSlug` + `username`**. The request must include **`start`** and **`end`**, and should support **`timeZone`**. ([cal.com][1])

Use the following stack:

* **Frontend:** React + TypeScript
* **Backend:** Node.js + Express
* Keep the API key on the server only
* Do not expose secrets in client-side code
* Use environment variables for all secrets
* Write clean, production-style code with clear file structure and comments where useful. Cal.com supports API keys, but for integrations they generally recommend OAuth; for a simple private tool for my own account, server-side API key usage is acceptable. ([cal.com][2])

Functional requirements:

* A simple page with:

  * a date range picker or two inputs: **start date** and **end date**
  * an input for **event type ID** or alternatively **event type slug** and **username**
  * an optional **time zone** field
  * a button: **Load available slots**
* When the user clicks the button, the frontend should call my backend
* The backend should call Cal.com and fetch my available slots
* Display the result as **plain readable text**, not as a calendar UI

Display format:

* Group slots by day
* Example output:

  * Monday, March 16, 2026

    * 09:00
    * 10:00
    * 14:30
  * Tuesday, March 17, 2026

    * 11:00
    * 15:00

Technical details:

* Create an Express endpoint such as `/api/availability`
* That endpoint should call Cal.com’s slots endpoint
* Use the response to extract slot start times
* Format the times in the selected timezone
* Handle loading, empty state, and API errors cleanly
* If no slots are available, show a clear text message such as: **No available slots found for this period**
* Validate inputs before sending the request
* Add basic error handling for missing environment variables, invalid dates, and Cal.com API failures

Implementation details:

* Use server-side fetch or axios in the backend
* Use `.env` variables such as:

  * `CAL_API_KEY=...`
  * `CAL_API_VERSION=...`
* The Cal.com authorization header must be:

  * `Authorization: Bearer <API_KEY>` ([cal.com][2])
* The request should target:

  * `https://api.cal.com/v2/slots` ([cal.com][1])

Important behavior:

* Default to returning slot start times as text only
* Keep the UI minimal and practical
* Do not build booking functionality
* Do not reserve slots
* Do not add authentication for end users unless needed later
* Make the app easy to extend later into a booking assistant

Output requirements:

* Generate the full code for both frontend and backend
* Include file structure
* Include setup instructions
* Include `.env.example`
* Include a short README with steps to run locally

If needed, make reasonable assumptions, but prefer a simple working MVP over unnecessary complexity.

**“Return the complete project code, organized by file, with no placeholders except environment variables.”**

[1]: https://cal.com/docs/api-reference/v2/slots/get-available-time-slots-for-an-event-type "Get available time slots for an event type - Cal.com Docs"
[2]: https://cal.com/docs/api-reference/v2/introduction "Introduction to API v2 - Cal.com Docs"

