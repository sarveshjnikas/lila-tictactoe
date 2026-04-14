# Multiplayer Tic Tac Toe — LILA Engineering Assignment

Built with **React** (frontend) + **Nakama** (game backend) + **PostgreSQL**.

## Live Links
- 🎮 **Game**: https://lila-tictactoe-olive.vercel.app
- ⚙️ **Nakama Server**: https://136.113.206.157.nip.io
- 📦 **Repo**: https://github.com/sarveshjnikas/lila-tictactoe

## Run Locally

**Backend:**
```bash
cd nakama
docker compose up
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000

> For local use, set `nakama.js` client host to `localhost`. For production it points to the GCP server.

## How to Test Multiplayer
1. Open the game in **two different browsers** (e.g. Chrome + Brave)
2. Enter different nicknames
3. Click **Auto Match** on both — you'll be paired automatically
4. Play the game!

## Stack
| Layer | Tech |
|-------|------|
| Frontend | React (Vercel) |
| Game Server | Nakama v3.22 (GCP) |
| Database | PostgreSQL 15 |
| HTTPS | Caddy + Let's Encrypt |

## Known Issues
- Draw result may display incorrectly on one client
- Play Again occasionally requires a page refresh

> First time working with Nakama/game backend infrastructure. Core win/lose gameplay works end to end.
