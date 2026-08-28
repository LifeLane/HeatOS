/**
 * HeatOS: Centralized AI Diagnostics & Request Telemetry Logger
 * 
 * Strict rule: NEVER log API keys or user secrets.
 */

import { AILogRecord } from './providerTypes';
import { FortyGuardLogger } from '../fortyguard/logger';

export class AILoggerService {
  private static recentLogs: AILogRecord[] = [];
  private static readonly MAX_LOGS = 200;

  public static record(log: AILogRecord): void {
    // Keep bounded in-memory buffer for diagnostics
    this.recentLogs.unshift(log);
    if (this.recentLogs.length > this.MAX_LOGS) {
      this.recentLogs.pop();
    }

    // Write structured server log
    FortyGuardLogger.info(`[AI_ROUTER] ${log.provider.toUpperCase()} | ${log.operation} | ${log.location} | ${log.latencyMs}ms | cacheHit=${log.cacheHit} | success=${log.success}${log.fallbackUsed ? ' [FALLBACK]' : ''}`, {
      provider: log.provider,
      model: log.model,
      operation: log.operation,
      latencyMs: log.latencyMs,
      cacheHit: log.cacheHit,
      success: log.success,
      fallbackUsed: log.fallbackUsed,
      retryCount: log.retryCount,
    });
  }

  public static getRecentLogs(limit: number = 50): AILogRecord[] {
    return this.recentLogs.slice(0, limit);
  }

  public static getSummaryStats() {
    const total = this.recentLogs.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        cacheHitRate: 0,
        groqCount: 0,
        nvidiaCount: 0,
        deterministicCount: 0,
        avgLatencyMs: 0,
      };
    }

    const cacheHits = this.recentLogs.filter(l => l.cacheHit).length;
    const groq = this.recentLogs.filter(l => l.provider === 'groq').length;
    const nvidia = this.recentLogs.filter(l => l.provider === 'nvidia').length;
    const deterministic = this.recentLogs.filter(l => l.provider === 'local_deterministic').length;
    const avgLatency = Math.round(
      this.recentLogs.reduce((acc, curr) => acc + curr.latencyMs, 0) / total
    );

    return {
      totalRequests: total,
      cacheHitRate: Math.round((cacheHits / total) * 100),
      groqCount: groq,
      nvidiaCount: nvidia,
      deterministicCount: deterministic,
      avgLatencyMs: avgLatency,
    };
  }
}
