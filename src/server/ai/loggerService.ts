/**
 * HeatOS: AI Execution Logging & Diagnostics Service
 */
import { AILogRecord } from './providerTypes';

export class AILoggerService {
  private static recentLogs: AILogRecord[] = [];
  private static MAX_LOGS = 100;

  public static log(record: AILogRecord) {
    this.recentLogs.unshift(record);
    if (this.recentLogs.length > this.MAX_LOGS) {
      this.recentLogs.pop();
    }
  }

  public static getRecentLogs(limit = 20): AILogRecord[] {
    return this.recentLogs.slice(0, limit);
  }

  public static getSummaryStats() {
    const total = this.recentLogs.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        cacheHitRate: 0,
        tabitokenCount: 0,
        deterministicCount: 0,
        avgLatencyMs: 0,
      };
    }

    const cacheHits = this.recentLogs.filter(l => l.cacheHit).length;
    const tabitokenCount = this.recentLogs.filter(l => l.provider === 'tabitoken').length;
    const deterministicCount = this.recentLogs.filter(l => l.provider === 'local_deterministic').length;
    const avgLatency = Math.round(
      this.recentLogs.reduce((acc, curr) => acc + curr.latencyMs, 0) / total
    );

    return {
      totalRequests: total,
      cacheHitRate: Math.round((cacheHits / total) * 100),
      tabitokenCount,
      deterministicCount,
      avgLatencyMs: avgLatency,
    };
  }
}

export const FortyGuardAIlogger = AILoggerService;
