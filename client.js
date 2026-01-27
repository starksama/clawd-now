/**
 * Clawd Status Updater - Update dashboard from your code
 * 
 * Usage:
 * const status = new ClawdStatusUpdater('http://localhost:3001');
 * await status.focused('Building...', 30);
 */

export class ClawdStatusUpdater {
  constructor(dashboardUrl = 'http://localhost:3001', updateInterval = 5000) {
    this.dashboardUrl = dashboardUrl;
    this.updateInterval = updateInterval;
    this.currentStatus = {
      phase: 'Building',
      task: 'Starting...',
      progress: 0,
      emotion: 'focused',
      energy: 100,
    };
    this.stats = {
      linesOfCode: 0,
      testsWritten: 0,
      commitsToday: 0,
      bugsFixed: 0,
    };
    this.energyDecayInterval = null;
    this.energyDecayRate = {
      focused: 2,
      happy: 1,
      excited: 3,
      stressed: 5,
      tired: 1,
      sleeping: -10, // negative = recovery
    };
  }

  /**
   * Update full status
   */
  async update(status) {
    this.currentStatus = {
      ...this.currentStatus,
      ...status,
    };

    return this.push();
  }

  /**
   * Push status to dashboard
   */
  async push() {
    try {
      const response = await fetch(`${this.dashboardUrl}/api/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.currentStatus,
          stats: this.stats,
        }),
      });

      if (!response.ok) {
        console.warn('Dashboard update failed:', response.status);
      }
      return response.ok;
    } catch (error) {
      console.warn('Cannot reach dashboard:', error.message);
      return false;
    }
  }

  // Emotion shortcuts
  async focused(task, progress) {
    return this.update({ emotion: 'focused', task, progress });
  }

  async happy(task, progress) {
    return this.update({ emotion: 'happy', task, progress });
  }

  async excited(task, progress) {
    return this.update({ emotion: 'excited', task, progress });
  }

  async stressed(task, progress) {
    return this.update({ emotion: 'stressed', task, progress });
  }

  async tired(task, progress) {
    return this.update({ emotion: 'tired', task, progress });
  }

  async sleeping(task, progress = 0) {
    return this.update({ emotion: 'sleeping', task, progress });
  }

  // Setters
  setEmotion(emotion) {
    this.currentStatus.emotion = emotion;
  }

  setProgress(progress) {
    this.currentStatus.progress = Math.min(100, Math.max(0, progress));
  }

  setTask(task) {
    this.currentStatus.task = task;
  }

  setEnergy(energy) {
    this.currentStatus.energy = Math.min(100, Math.max(0, energy));
  }

  setPhase(phase) {
    this.currentStatus.phase = phase;
  }

  // Stats tracking
  addLineOfCode(count = 1) {
    this.stats.linesOfCode += count;
    this.push();
  }

  addTest(count = 1) {
    this.stats.testsWritten += count;
    this.push();
  }

  addCommit() {
    this.stats.commitsToday += 1;
    this.push();
  }

  addBugFix() {
    this.stats.bugsFixed += 1;
    this.push();
  }

  // Energy management
  startEnergyDecay(interval = this.updateInterval) {
    if (this.energyDecayInterval) this.stopEnergyDecay();

    this.energyDecayInterval = setInterval(() => {
      const emotion = this.currentStatus.emotion;
      const decayRate = this.energyDecayRate[emotion] || 2;
      const newEnergy = Math.max(0, this.currentStatus.energy - (decayRate / 60) * (interval / 1000));
      
      this.setEnergy(newEnergy);
      this.push();
    }, interval);
  }

  stopEnergyDecay() {
    if (this.energyDecayInterval) {
      clearInterval(this.energyDecayInterval);
      this.energyDecayInterval = null;
    }
  }

  // Boost energy
  async coffee() {
    this.currentStatus.energy = Math.min(100, this.currentStatus.energy + 15);
    return this.update({
      emotion: 'excited',
      task: 'Energized! ☕',
    });
  }

  async sleep() {
    this.currentStatus.energy = 100;
    return this.update({
      emotion: 'sleeping',
      task: 'Resting...',
    });
  }

  // Get current state
  getStatus() {
    return { ...this.currentStatus };
  }

  getStats() {
    return { ...this.stats };
  }

  resetStats() {
    this.stats = {
      linesOfCode: 0,
      testsWritten: 0,
      commitsToday: 0,
      bugsFixed: 0,
    };
  }
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const status = new ClawdStatusUpdater();
  
  (async () => {
    console.log('🤖 Clawd Status Demo\n');

    await status.focused('Analyzing contract...', 10);
    console.log('Started analysis');
    
    status.startEnergyDecay();
    
    for (let i = 20; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await status.focused(`Progress: ${i}%`, i);
      status.addLineOfCode(Math.round(Math.random() * 50));
      console.log(`Progress: ${i}%`);
    }
    
    status.stopEnergyDecay();
    await status.happy('Complete! ✓', 100);
    status.addCommit();
    
    console.log('\nFinal stats:', status.getStats());
  })();
}
