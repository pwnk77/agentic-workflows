export interface ThoughtState {
  currentThought: number;
  totalThoughts: number;
  phase: string;
  canRevise: boolean;
  canBranch: boolean;
  reasoning: string;
  nextAction?: string;
}

export interface ThoughtProgress {
  thoughts: ThoughtState[];
  currentPhase: string;
  overallProgress: number;
  startTime: string;
  lastUpdate: string;
}

export class SequentialThinkingManager {
  private thoughtProgress: Map<string, ThoughtProgress> = new Map();

  startThinking(sessionId: string, totalThoughts: number, phase: string): string {
    const progress: ThoughtProgress = {
      thoughts: [],
      currentPhase: phase,
      overallProgress: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    this.thoughtProgress.set(sessionId, progress);
    return sessionId;
  }

  addThought(
    sessionId: string,
    reasoning: string,
    canRevise: boolean = true,
    canBranch: boolean = false,
    nextAction?: string
  ): ThoughtState {
    const progress = this.thoughtProgress.get(sessionId);
    if (!progress) {
      throw new Error(`No thinking session found for ${sessionId}`);
    }

    const thoughtNumber = progress.thoughts.length + 1;
    const thought: ThoughtState = {
      currentThought: thoughtNumber,
      totalThoughts: Math.max(progress.thoughts.length + 1, thoughtNumber),
      phase: progress.currentPhase,
      canRevise,
      canBranch,
      reasoning,
      nextAction
    };

    progress.thoughts.push(thought);
    progress.lastUpdate = new Date().toISOString();
    progress.overallProgress = (thoughtNumber / thought.totalThoughts) * 100;

    return thought;
  }

  updatePhase(sessionId: string, newPhase: string, additionalThoughts: number = 0): void {
    const progress = this.thoughtProgress.get(sessionId);
    if (!progress) {
      throw new Error(`No thinking session found for ${sessionId}`);
    }

    progress.currentPhase = newPhase;
    progress.lastUpdate = new Date().toISOString();

    // Update total thoughts if needed
    if (additionalThoughts > 0) {
      const lastThought = progress.thoughts[progress.thoughts.length - 1];
      if (lastThought) {
        lastThought.totalThoughts += additionalThoughts;
      }
    }
  }

  reviseThought(sessionId: string, thoughtIndex: number, newReasoning: string): ThoughtState {
    const progress = this.thoughtProgress.get(sessionId);
    if (!progress) {
      throw new Error(`No thinking session found for ${sessionId}`);
    }

    const thought = progress.thoughts[thoughtIndex];
    if (!thought) {
      throw new Error(`No thought found at index ${thoughtIndex}`);
    }

    if (!thought.canRevise) {
      throw new Error(`Thought at index ${thoughtIndex} cannot be revised`);
    }

    thought.reasoning = newReasoning;
    progress.lastUpdate = new Date().toISOString();

    return thought;
  }

  branchThinking(sessionId: string, fromThoughtIndex: number, newReasoning: string): string {
    const progress = this.thoughtProgress.get(sessionId);
    if (!progress) {
      throw new Error(`No thinking session found for ${sessionId}`);
    }

    const thought = progress.thoughts[fromThoughtIndex];
    if (!thought || !thought.canBranch) {
      throw new Error(`Cannot branch from thought at index ${fromThoughtIndex}`);
    }

    // Create new branch session
    const branchSessionId = `${sessionId}_branch_${Date.now()}`;
    const branchProgress: ThoughtProgress = {
      thoughts: progress.thoughts.slice(0, fromThoughtIndex + 1), // Copy thoughts up to branch point
      currentPhase: progress.currentPhase,
      overallProgress: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    this.thoughtProgress.set(branchSessionId, branchProgress);

    // Add the new reasoning as the first thought in the branch
    this.addThought(branchSessionId, newReasoning);

    return branchSessionId;
  }

  getThoughtProgress(sessionId: string): ThoughtProgress | null {
    return this.thoughtProgress.get(sessionId) || null;
  }

  formatThoughtsForDisplay(sessionId: string): string {
    const progress = this.thoughtProgress.get(sessionId);
    if (!progress) {
      return 'No thinking progress found.';
    }

    let output = `🧠 Thinking Progress - Phase: ${progress.currentPhase}\n`;
    output += `📊 Overall Progress: ${Math.round(progress.overallProgress)}%\n`;
    output += `⏱️ Started: ${new Date(progress.startTime).toLocaleString()}\n\n`;

    for (const [index, thought] of progress.thoughts.entries()) {
      output += `💭 Thought ${thought.currentThought}/${thought.totalThoughts}:\n`;
      output += `${thought.reasoning}\n`;

      if (thought.nextAction) {
        output += `➡️ Next: ${thought.nextAction}\n`;
      }

      if (index < progress.thoughts.length - 1) {
        output += '\n---\n\n';
      }
    }

    return output;
  }

  completeThinking(sessionId: string): ThoughtProgress {
    const progress = this.thoughtProgress.get(sessionId);
    if (!progress) {
      throw new Error(`No thinking session found for ${sessionId}`);
    }

    progress.overallProgress = 100;
    progress.lastUpdate = new Date().toISOString();

    return progress;
  }

  cleanupSession(sessionId: string): void {
    this.thoughtProgress.delete(sessionId);
  }
}

// Global instance for use across tools
export const sequentialThinking = new SequentialThinkingManager();

// Predefined thinking patterns for different workflow types
export const THINKING_PATTERNS = {
  ARCHITECT: {
    phases: ['crystallization', 'exploration', 'specification'],
    thoughtsPerPhase: [5, 7, 6],
    totalThoughts: 18
  },
  ENGINEER: {
    phases: ['analysis', 'design', 'implementation', 'testing'],
    thoughtsPerPhase: [3, 4, 8, 3],
    totalThoughts: 18
  },
  REVIEWER: {
    phases: ['assessment', 'analysis', 'recommendations'],
    thoughtsPerPhase: [4, 6, 4],
    totalThoughts: 14
  }
} as const;