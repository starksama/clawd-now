import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();

// ── Auto-sleep timeout ──────────────────────────────
const AUTO_SLEEP_MS = 5 * 60 * 1000; // 5 minutes
let lastSignal = Date.now();
let autoSleepTimer: ReturnType<typeof setTimeout> | null = null;

interface StarkState {
  emotion: string;
  task: string;
  energy: number;
}

let state: StarkState = {
  emotion: 'sleeping',
  task: 'Resting peacefully...',
  energy: 100,
};

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// ── API ─────────────────────────────────────────────

// GET current state
app.get('/api/status', (_req, res) => res.json(state));

// POST update — main signal endpoint
app.post('/api/update', (req, res) => {
  const { emotion, task, energy } = req.body;
  if (emotion) state.emotion = emotion;
  if (task) state.task = task;
  if (energy !== undefined) state.energy = Math.min(100, Math.max(0, energy));

  lastSignal = Date.now();
  resetAutoSleep();
  broadcast({ type: 'statusUpdate', data: state });
  res.json({ ok: true, status: state });
});

// POST quick signal — convenience endpoint
// e.g., POST /api/signal/focused { task: "Building..." }
app.post('/api/signal/:emotion', (req, res) => {
  const emotion = req.params.emotion;
  state.emotion = emotion;
  if (req.body.task) state.task = req.body.task;
  if (req.body.energy !== undefined) state.energy = req.body.energy;

  lastSignal = Date.now();
  resetAutoSleep();
  broadcast({ type: 'statusUpdate', data: state });
  res.json({ ok: true, status: state });
});

// ── WebSocket ───────────────────────────────────────
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'statusUpdate', data: state }));
  ws.on('close', () => clients.delete(ws));
});

function broadcast(msg: object) {
  const data = JSON.stringify(msg);
  for (const c of clients) {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  }
}

// ── Auto-sleep ──────────────────────────────────────
function resetAutoSleep() {
  if (autoSleepTimer) clearTimeout(autoSleepTimer);
  // Don't auto-sleep if already sleeping
  if (state.emotion === 'sleeping') return;

  autoSleepTimer = setTimeout(() => {
    state.emotion = 'sleeping';
    state.task = 'Resting peacefully...';
    broadcast({ type: 'statusUpdate', data: state });
    console.log('💤 Auto-sleep: no signal for 5 minutes');
  }, AUTO_SLEEP_MS);
}

// ── Start ───────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🤖 clawd-now → http://localhost:${PORT}`);
  console.log(`   Auto-sleep after ${AUTO_SLEEP_MS / 1000}s of no signals\n`);
});
