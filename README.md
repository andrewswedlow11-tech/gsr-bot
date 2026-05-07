# Georgia State Roleplay — Discord Bot

A Discord bot for GSR that integrates with the ER:LC API to show live server status, manage session polls, and announce active sessions.

---

## Features

- `/status` — Live ERLC server embed with player count, queue, and server code
- `/sessionpoll` — Start a session vote with Vote / View Voters / Cancel buttons; auto-alerts when threshold is reached
- `/startsession` — Post an active session announcement with live player count and a Refresh button

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | What it is |
|---|---|
| `DISCORD_TOKEN` | Your bot token from [discord.dev](https://discord.com/developers) |
| `CLIENT_ID` | Your bot's application ID |
| `GUILD_ID` | Your Discord server ID |
| `ERLC_API_KEY` | Your ER:LC server key (Server Settings → API) |
| `VOTES_REQUIRED` | Default votes needed to reach threshold (e.g. `20`) |
| `STAFF_ROLE_ID` | Role ID allowed to start/cancel polls |
| `BANNER_URL` | Direct image URL for your GSR banner |

### 3. Deploy slash commands
```bash
npm run deploy
```

### 4. Start the bot
```bash
npm start
```

---

## Getting your ERLC API Key

1. Open ER:LC
2. Go to **Server Settings**
3. Click **API** tab
4. Copy your **Server Key**

---

## File Structure

```
gsr-bot/
├── commands/
│   ├── sessionpoll.js     # /sessionpoll command
│   ├── startsession.js    # /startsession command
│   └── status.js          # /status command
├── events/
│   ├── interactionCreate.js  # Handles all button & slash interactions
│   └── ready.js              # Bot startup log
├── utils/
│   ├── embeds.js          # All embed builders
│   └── erlc.js            # ERLC API wrapper
├── deploy-commands.js     # Run once to register slash commands
├── index.js               # Bot entry point
└── .env                   # Your config (never commit this)
```

---

## Commands

| Command | Permission | Description |
|---|---|---|
| `/status` | Everyone | Shows live ERLC server status |
| `/sessionpoll [votes] [area]` | Staff role | Starts a session vote |
| `/startsession [area]` | Staff role | Posts active session announcement |
