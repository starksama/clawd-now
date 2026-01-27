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

app.get('/api/status', (_req, res) => res.json(state));

app.post('/api/update', (req, res) => {
  const { emotion, task, energy } = req.body;
  if (emotion) state.emotion = emotion;
  if (task) state.task = task;
  if (energy !== undefined) state.energy = Math.min(100, Math.max(0, energy));
  broadcast({ type: 'statusUpdate', data: state });
  res.json({ ok: true, status: state });
});

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'statusUpdate', data: state }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'interact') {
        handleInteraction(msg.action);
      }
    } catch {}
  });

  ws.on('close', () => clients.delete(ws));
});

function broadcast(msg: object) {
  const data = JSON.stringify(msg);
  for (const c of clients) {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  }
}

function handleInteraction(action: string) {
  broadcast({ type: 'interaction', action });

  // Temporarily go happy
  const prev = state.emotion;
  state.emotion = action === 'tickle' ? 'excited' : 'happy';
  broadcast({ type: 'statusUpdate', data: state });

  setTimeout(() => {
    state.emotion = prev;
    broadcast({ type: 'statusUpdate', data: state });
  }, 2500);
}

server.listen(PORT, () => {
  console.log(`\n🤖 Stark Dashboard → http://localhost:${PORT}\n`);
});
