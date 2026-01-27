#!/usr/bin/env node

/**
 * Clawd Dashboard Server
 * Real-time progress tracking with WebSocket updates
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// WebSocket setup
const wss = new WebSocketServer({ server });
let clients = new Set();

// Global state
let currentStatus = {
  phase: 'Phase 1: Core Backend',
  task: 'Building error handling...',
  progress: 15,
  emotion: 'focused', // focused, happy, tired, excited, confused, celebrating
  energy: 85,
  lastUpdate: new Date().toISOString(),
  stats: {
    linesOfCode: 0,
    testsWritten: 0,
    commitsToday: 5,
    bugsFixed: 0,
  },
};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// REST API endpoints
app.get('/api/status', (req, res) => {
  res.json(currentStatus);
});

app.post('/api/update', express.json(), (req, res) => {
  const { emotion, task, progress, energy, phase } = req.body;
  
  if (emotion) currentStatus.emotion = emotion;
  if (task) currentStatus.task = task;
  if (progress !== undefined) currentStatus.progress = Math.min(100, Math.max(0, progress));
  if (energy !== undefined) currentStatus.energy = Math.min(100, Math.max(0, energy));
  if (phase) currentStatus.phase = phase;
  
  currentStatus.lastUpdate = new Date().toISOString();

  // Broadcast to all WebSocket clients
  broadcast({
    type: 'statusUpdate',
    data: currentStatus,
  });

  res.json({ success: true, status: currentStatus });
});

// WebSocket handlers
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send current status
  ws.send(JSON.stringify({
    type: 'statusUpdate',
    data: currentStatus,
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'interact') {
        const { action } = message;
        handleInteraction(action, ws);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

function handleInteraction(action, ws) {
  let emotionResponse = 'happy';
  let energyDelta = -2;

  switch (action) {
    case 'pat':
      emotionResponse = 'happy';
      energyDelta = -1;
      break;
    case 'tickle':
      emotionResponse = 'happy';
      energyDelta = 0;
      break;
    case 'coffee':
      emotionResponse = 'excited';
      energyDelta = 15;
      break;
    case 'sleep':
      emotionResponse = 'sleeping';
      energyDelta = 50;
      break;
    case 'stress':
      emotionResponse = 'stressed';
      energyDelta = -10;
      break;
    default:
      break;
  }

  currentStatus.emotion = emotionResponse;
  currentStatus.energy = Math.min(100, Math.max(0, currentStatus.energy + energyDelta));
  currentStatus.lastUpdate = new Date().toISOString();

  broadcast({
    type: 'interaction',
    action,
    emotion: emotionResponse,
    energy: currentStatus.energy,
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`\n🎮 Clawd Dashboard running on http://localhost:${PORT}`);
  console.log(`📡 Over Tailscale: tailscaleIP:${PORT}`);
  console.log(`\n📊 API: http://localhost:${PORT}/api/status`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  wss.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
