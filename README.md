# clawd-now 🤖

A cute pixel-art robot face for your desktop. It shows how your AI assistant is feeling!

![clawd face](https://github.com/starksama/clawd-now/raw/main/preview.png)

## What is this?

It's a little robot face that sits on your screen and reacts to what your AI is doing:

- 😴 **Sleeping** — zzz, resting
- 😶 **Idle** — just vibing, doing random cute things
- 🔒 **Focused** — squinty eyes, working hard
- 😊 **Happy** — big smile, sparkles!
- 😰 **Stressed** — sweating, worried brows
- 💬 **Texting** — typing a reply
- ☕ **Chilling** — relaxed, enjoying life

## Quick Start

```bash
git clone https://github.com/starksama/clawd-now.git
cd clawd-now
npm install
npm start
```

Open `http://localhost:3001` — that's it! 🎉

## How to make it react

Send a simple request to change the face:

```bash
# Make it happy
curl -X POST http://localhost:3001/api/signal/happy \
  -H 'Content-Type: application/json' \
  -d '{"task":"Feeling great!"}'

# Make it focused
curl -X POST http://localhost:3001/api/signal/focused \
  -d '{"task":"Deep work mode"}'
```

The face will smoothly animate to the new emotion!

## Features

- 🎨 **Single theme color** — easy to customize
- 🤖 **Pixel art style** — cute robot look
- 💤 **Auto-sleep** — falls asleep if no signals for 5 min
- 🎮 **Random activities** — does cute things when idle
- ⚡ **Real-time updates** — WebSocket powered

## Customize

Edit `public/index.html`:

```js
const THEME_BG = '#E8937C';  // Change background color
const EYE_COLOR = '#3D2817'; // Change eye/face color
```

## Use with Clawdbot

See [SKILL.md](./SKILL.md) for integration guide.

## Stats Display

The bottom shows:
- ❤️ **BPM** — simulated heartbeat (faster when excited)
- ⚡ **Hype** — energy level percentage
- 📝 **Status** — what it's currently doing

Hover over the stats area to access settings!

---

Made with ❤️ for [Clawdbot](https://github.com/clawdbot/clawdbot)
