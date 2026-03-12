# Cal.com Availability Viewer

A simple web app that shows your available Cal.com time slots as plain text.

## Setup

### 1. Install dependencies

```bash
npm install
cd server && npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

- `CAL_API_KEY` — Your Cal.com API key (Settings > Developer > API Keys)
- `CAL_API_VERSION` — Cal.com API version (e.g. `2024-08-13`)

### 3. Run locally

```bash
npm run dev
```

This starts both the Vite frontend (port 5173) and Express backend (port 3001). Vite proxies `/api` requests to Express automatically.

Open http://localhost:5173 in your browser.

## Usage

1. Select a start and end date
2. Enter either an **Event Type ID** or an **Event Type Slug + Username**
3. Optionally set a time zone
4. Click **Load available slots**

Slots are displayed grouped by day in plain text format.
