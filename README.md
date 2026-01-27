# clawd-now 🤖

Live status face — a minimalist pixel-art companion that shows what clawd is up to in real-time.

Full-screen face with two eyes + a mouth on a warm salmon background. The browser tab title always reflects the current vibe: `clawd: locked in`, `clawd: LFG!!`, `clawd: zzz...`, etc.

## Quick Start

```bash
npm install
npm run dev     # → http://localhost:3001
```

## How It Works

The face is drawn on a `<canvas>` element. A single `openness` value controls everything:
- Eyes smoothly transition between squares (open) and flat bars (closed)
- Mouth appears/disappears in sync with eyes
- All transitions use `lerp()` — no sudden jumps
- **Tab title** updates dynamically with the current vibe status

### Emotions

Signal an emotion via the API and the face transitions smoothly:

| Emotion | Eyes | Mouth | Movement | BPM | Hype | Tab Title |
|---------|------|-------|----------|-----|------|-----------|
| `sleeping` | flat bars + Z's | hidden | barely moves | 45-55 | 5-15% | `clawd: zzz...` |
| `idle` | normal | sometimes | gentle bob | 60-70 | 20-40% | `clawd: vibing` |
| `focused` | 咪咪眼 (squinty) | rare | locked-in | 72-82 | 50-70% | `clawd: locked in` |
| `happy` | open | often | bouncy | 75-85 | 60-80% | `clawd: feeling good` |
| `excited` | wide + open mouth | always | fast bounce | 95-120 | 85-100% | `clawd: LFG!!` |
| `stressed` | narrowed + jitter | rare | twitchy | 88-105 | 30-50% | `clawd: sweating` |
| `tired` | half-closed | sometimes | sluggish | 50-60 | 10-25% | `clawd: need coffee` |
| `bored` | half-lidded | sometimes | eyes wander | 55-65 | 5-20% | `clawd: meh...` |
| `curious` | wide open | often | eyes dart | 70-85 | 55-75% | `clawd: interesting...` |

### Stats Panel

At the bottom of the screen (white text, subtle but readable):
- **♥ BPM** — heart rate that fluctuates within the emotion's range
- **⚡ Hype %** — how excited about the current task
- **Vibe** — emoji + mood word
- **Task** — what's currently happening

## API

### Update State

```bash
# Full update
curl -X POST http://localhost:3001/api/update \
  -H 'Content-Type: application/json' \
  -d '{"emotion":"focused","task":"Building analyzers...","energy":75}'

# Quick signal
curl -X POST http://localhost:3001/api/signal/excited \
  -H 'Content-Type: application/json' \
  -d '{"task":"Ship it!"}'

# Get current state
curl http://localhost:3001/api/status
```

### Shell Helper

```bash
./bin/stark-signal focused "Deep in code..."
./bin/stark-signal bored "Writing tests..."
./bin/stark-signal excited "Feature complete!"
./bin/stark-signal sleeping
```

### WebSocket

Connect to `ws://localhost:3001` for real-time updates:

```json
{ "type": "statusUpdate", "data": { "emotion": "focused", "task": "...", "energy": 75 } }
```

## Auto-Sleep

If no signal is received for **5 minutes**, the face automatically transitions to sleeping. Tab title updates to `clawd: zzz...`.

## Architecture

```
public/index.html   — Canvas renderer + animation loop + dynamic title
src/server.ts       — Express + WebSocket server
bin/stark-signal    — Shell helper script
```

### Animation System

Each emotion is a **profile** with parameters:
- `eyeOpen` — default eye openness (0-1)
- `mouthChance` — probability of mouth appearing
- `bobSpeed/Amount` — breathing rhythm
- `driftSpeed/Amount` — eye look-around behavior
- `blinkRate/squintRate` — animation event frequency
- `eventDelay` — timing between animation events
- `jitter` — micro-shake (stressed only)
- `showZzz` — floating Z's (sleeping only)

Profile transitions are smooth (`lerp` at 0.02 rate).

## Design Philosophy

- **Face is the star** — everything else is subtle
- **Tab tells the story** — always know the vibe at a glance
- **Same components, different parameters** — eyes + mouth + background, that's it
- **Smooth transitions** — never snap, always lerp
- **Minimal footprint** — single HTML file, no build step for frontend
