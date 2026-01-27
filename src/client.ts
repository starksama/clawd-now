/**
 * Stark Signal Client
 *
 * Send emotional signals to the dashboard.
 * Non-blocking, silent failures — never interrupts main work.
 *
 * Usage:
 *   import { stark } from './client.js';
 *   await stark.sleeping();
 *   await stark.focused('Building analyzers...');
 *   await stark.happy('Tests passing!');
 *   await stark.excited('Ship it!');
 */

export type Emotion = 'sleeping' | 'idle' | 'focused' | 'happy' | 'excited' | 'stressed' | 'tired' | 'bored' | 'curious';

interface StarkState {
  emotion: Emotion;
  task: string;
  energy: number;
}

export class StarkSignal {
  private url: string;
  private state: StarkState = {
    emotion: 'sleeping',
    task: 'Resting peacefully...',
    energy: 100,
  };

  constructor(dashboardUrl = 'http://localhost:3001') {
    this.url = dashboardUrl;
  }

  // ── Quick Emotions ──────────────────────────────
  async sleeping(task = 'Resting peacefully...')    { return this.signal('sleeping', task); }
  async idle(task = 'Just hanging out...')          { return this.signal('idle', task); }
  async focused(task = 'Deep in thought...')        { return this.signal('focused', task); }
  async happy(task = 'Going well!')                 { return this.signal('happy', task); }
  async excited(task = 'Amazing!')                  { return this.signal('excited', task); }
  async stressed(task = 'Working through it...')    { return this.signal('stressed', task); }
  async tired(task = 'Need a break...')             { return this.signal('tired', task); }
  async bored(task = 'This is tedious...')           { return this.signal('bored', task); }
  async curious(task = 'Hmm interesting...')          { return this.signal('curious', task); }

  // ── Signal ──────────────────────────────────────
  async signal(emotion: Emotion, task?: string, energy?: number): Promise<boolean> {
    this.state.emotion = emotion;
    if (task !== undefined) this.state.task = task;
    if (energy !== undefined) this.state.energy = Math.min(100, Math.max(0, energy));
    return this.push();
  }

  // ── Energy ──────────────────────────────────────
  async setEnergy(energy: number): Promise<boolean> {
    this.state.energy = Math.min(100, Math.max(0, energy));
    return this.push();
  }

  // ── Push to Dashboard ───────────────────────────
  private async push(): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/api/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state),
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false; // silent fail — dashboard is optional
    }
  }

  get current(): StarkState {
    return { ...this.state };
  }
}

// Singleton
export const stark = new StarkSignal();
