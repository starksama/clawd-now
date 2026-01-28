# clawd-now Dashboard Skill

A cute pixel-art robot face dashboard for Clawdbot. Express emotions via simple HTTP signals.

## Installation

```bash
git clone https://github.com/starksama/clawd-now.git
cd clawd-now
npm install
npm start
```

Dashboard runs at `http://localhost:3001`

## Usage

Signal emotions via POST request:

```bash
curl -X POST http://localhost:3001/api/signal/{emotion} \
  -H 'Content-Type: application/json' \
  -d '{"task":"What you are doing..."}'
```

## Emotions

| Emotion | Description | Visual |
|---------|-------------|--------|
| `sleeping` | 💤 Eyes almost closed, zzz particles | Rest mode |
| `idle` | 😶 Neutral, relaxed | Default state |
| `focused` | 🔒 Squinted eyes, furrowed brows | Deep work |
| `happy` | 😊 Wide eyes, raised brows, smile | Positive |
| `stressed` | 😰 Worried brows, wavy mouth, sweat | Urgent |
| `texting` | 💬 Attentive, normal eyes | Responding |
| `chilling` | ☕ Relaxed smile, enjoying life | Leisure |

### Legacy Aliases
These map to core emotions:
- `excited` → happy
- `tired` → sleeping
- `bored` → idle
- `curious` → idle
- `thinking` → focused
- `angry` → stressed
- `inlove` → happy

## Clawdbot Integration

Add to your `TOOLS.md`:

```markdown
### Express Emotion (Dashboard)
- **URL:** http://localhost:3001
- **Signal API:** `POST /api/signal/{emotion}` with `{"task":"..."}`
- **Core Emotions:** sleeping, idle, focused, happy, stressed, texting, chilling
- **RULE:** Signal EVERY message and heartbeat. Your face is always on.
```

### Heartbeat Example

In `HEARTBEAT.md`:
```markdown
## Dashboard Signal (MANDATORY)
Signal the dashboard to keep the face alive:
curl -s -X POST http://localhost:3001/api/signal/{emotion} \
  -H 'Content-Type: application/json' \
  -d '{"task":"..."}' > /dev/null 2>&1
```

## Features

- **Single theme color** — Change `THEME_BG` in `public/index.html` to customize
- **Pixel art style** — All emotions via pixel arrangements (eyes, brows, mouth)
- **Auto-sleep** — Falls asleep after 5 min without signals
- **Auto-return to idle** — Returns to idle after 2 min (from non-sleeping states)
- **Random idle activities** — Desktop pet style animations when idle
- **WebSocket updates** — Real-time face updates

## Customization

Edit `public/index.html`:
- `THEME_BG` — Background color (default: `#E8937C`)
- `EYE_COLOR` — Eye/mouth color (default: `#3D2817`)
- `PROFILES` — Emotion parameters (eye size, brows, mouth, etc.)

## API Endpoints

- `GET /api/status` — Current emotion state
- `POST /api/update` — Full state update `{emotion, task, energy}`
- `POST /api/signal/:emotion` — Quick emotion signal `{task}`
