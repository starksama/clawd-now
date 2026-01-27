/**
 * Stark Status - Express yourself through Clawd Dashboard
 * 
 * The dashboard is YOUR emotional state & current focus
 * Use this to communicate how you're feeling about what you're doing
 */

export class StarkStatus {
  constructor(dashboardUrl = 'http://localhost:3001') {
    this.dashboardUrl = dashboardUrl;
    this.currentStatus = {
      emotion: 'focused',
      task: 'Working...',
      energy: 100,
    };
  }

  /**
   * Express current emotional state + what you're doing
   * 
   * Example:
   * await status.focused('Building error handling...'); // ⟹ 🔍 focused face
   * await status.happy('Tests passing! ✓');             // ⟹ 😊 happy bounce
   * await status.excited('Major milestone!');           // ⟹ 🎉 excited pulse
   */

  async focused(task) {
    return this.setState('focused', task);
  }

  async happy(task) {
    return this.setState('happy', task);
  }

  async excited(task) {
    return this.setState('excited', task);
  }

  async stressed(task) {
    return this.setState('stressed', task);
  }

  async tired(task) {
    return this.setState('tired', task);
  }

  async sleeping(task = 'Resting...') {
    return this.setState('sleeping', task);
  }

  /**
   * Full control - set emotion + task + energy
   */
  async setState(emotion, task, energy = null) {
    this.currentStatus = {
      emotion,
      task,
      energy: energy !== null ? energy : this.currentStatus.energy,
    };
    return this.push();
  }

  /**
   * Adjust energy without changing emotion/task
   */
  async setEnergy(energy) {
    this.currentStatus.energy = Math.min(100, Math.max(0, energy));
    return this.push();
  }

  async addEnergy(amount) {
    return this.setEnergy(this.currentStatus.energy + amount);
  }

  async removeEnergy(amount) {
    return this.setEnergy(this.currentStatus.energy - amount);
  }

  /**
   * Convenience methods for common feelings
   */
  async thinking(task) {
    return this.focused(`Thinking about ${task}...`);
  }

  async working(task) {
    return this.focused(`Working on ${task}...`);
  }

  async debugging(problem) {
    return this.stressed(`Debugging: ${problem}`);
  }

  async celebrating(achievement) {
    return this.excited(`🎉 ${achievement}`);
  }

  async stuck(issue) {
    return this.stressed(`Stuck on: ${issue}`);
  }

  /**
   * Energy management
   */
  startEnergyDecay(emotionDecayMap = {}) {
    const defaults = {
      focused: 0.5,    // -0.5/second while focused
      happy: 0.3,      // -0.3/second while happy
      excited: 1.0,    // -1.0/second while excited (drains fast)
      stressed: 1.5,   // -1.5/second while stressed
      tired: 0.2,      // -0.2/second while tired
      sleeping: -2.0,  // +2.0/second while sleeping (recovery!)
    };
    const map = { ...defaults, ...emotionDecayMap };

    this.decayInterval = setInterval(() => {
      const emotion = this.currentStatus.emotion;
      const rate = map[emotion] || 0.5;
      this.removeEnergy(rate / 10); // per 100ms tick
    }, 100);
  }

  stopEnergyDecay() {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
    }
  }

  async coffee() {
    await this.addEnergy(20);
    await this.excited('☕ Energized!');
    return new Promise(r => setTimeout(r, 1000)); // quick buzz
  }

  async rest() {
    await this.sleeping('Taking a break...');
    await this.addEnergy(50);
  }

  /**
   * Push status to dashboard
   */
  async push() {
    try {
      const response = await fetch(`${this.dashboardUrl}/api/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentStatus),
      });
      return response.ok;
    } catch (error) {
      console.warn('Dashboard unreachable:', error.message);
      return false;
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return { ...this.currentStatus };
  }
}

// Demo/test mode
if (import.meta.url === `file://${process.argv[1]}`) {
  const stark = new StarkStatus();

  (async () => {
    console.log('🤖 Stark Status Demo\n');

    await stark.focused('Starting build...');
    console.log('✓ Focused');

    await new Promise(r => setTimeout(r, 2000));
    await stark.working('Implementing analyzers');
    console.log('✓ Working');

    await new Promise(r => setTimeout(r, 2000));
    await stark.stressed('Tests failing...');
    console.log('✓ Stressed');

    await new Promise(r => setTimeout(r, 2000));
    await stark.happy('All tests passing! ✓');
    console.log('✓ Happy');

    await new Promise(r => setTimeout(r, 2000));
    await stark.excited('Feature complete!');
    console.log('✓ Excited');

    console.log('\n✨ Demo complete!');
  })();
}
