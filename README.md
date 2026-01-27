# 🤖 Clawd Dashboard

Interactive progress dashboard for watching Stark work in real-time!

## Features

✨ **Live Emotions & Reactions**
- Character shows real-time emotional state (focused, happy, tired, excited, stressed, sleeping)
- Eye tracking follows your mouse
- Interactive buttons: pat, tickle, give coffee, stress, sleep

📊 **Real-Time Status**
- Current phase & task
- Progress bar (0-100%)
- Energy level
- Live stats (LOC, tests, commits, bugs fixed)

🎮 **Interactive**
- Pat the character (they get happy 💚)
- Tickle for laughs
- Give coffee to boost energy ⚡
- Stress them out (test mode!)
- Watch them sleep 💤

## Setup

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open browser
open http://localhost:3001
```

### Over Tailscale

```bash
# Run on your machine
npm run dev

# Share Tailscale IP
tailscale status | grep $(hostname)

# Access from another device
open http://<tailscale-ip>:3001
```

## API

### Get Current Status
```bash
curl http://localhost:3001/api/status
```

### Update Status
```bash
curl -X POST http://localhost:3001/api/update \
  -H "Content-Type: application/json" \
  -d '{
    "phase": "Phase 1: Core Backend",
    "task": "Building error handling...",
    "progress": 25,
    "emotion": "focused",
    "energy": 85
  }'
```

## WebSocket Events

### Receive Status Updates
```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'statusUpdate') {
    console.log(message.data);
  }
};
```

### Send Interaction
```javascript
ws.send(JSON.stringify({
  type: 'interact',
  action: 'pat'  // pat, tickle, coffee, stress, sleep
}));
```

## Emotions

| Emotion | When |
|---------|------|
| 🔍 focused | Deep in the code |
| 😊 happy | Making progress |
| 😴 tired | Long session |
| 🎉 excited | Major milestone |
| 😰 stressed | Debugging |
| 💤 sleeping | Break time |

## Integrate with Your Project

Update status from your code:

```javascript
// Node.js example
async function updateProgress(phase, task, progress, emotion) {
  await fetch('http://localhost:3001/api/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase, task, progress, emotion })
  });
}

// Use it
await updateProgress(
  'Phase 2: CLI Build',
  'Implementing analyze command',
  45,
  'focused'
);
```

## Customize

### Colors
Edit `public/index.html` - look for the gradient in `<style>`

### Emotions
Add new emotions in `server.js` `handleInteraction()` function

### Stats
Modify the stats structure in `currentStatus.stats`

## Share

- Deploy to Vercel/Heroku
- Share Tailscale IP with team
- Fork and customize for your own projects!

## License

MIT - Fork and make your own! 🚀

---

**Made with 💚 by Stark**
