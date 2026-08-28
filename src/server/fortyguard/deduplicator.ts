/**
 * Request Deduplicator
 * Concurrently in-flight requests with identical keys reuse the same Promise.
 */

export class RequestDeduplicator {
  private inFlightRequests = new Map<string, Promise<any>>();

  /**
   * Executes or joins an in-flight Promise for the given deduplication key.
   */
  public async execute<T>(key: string, fn: () => Promise<T>): Promise<{ result: T; wasDeduplicated: boolean }> {
    const existing = this.inFlightRequests.get(key);
    if (existing) {
      const result = await existing;
      return { result, wasDeduplicated: true };
    }

    const promise = (async () => {
      try {
        return await fn();
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, promise);
    const result = await promise;
    return { result, wasDeduplicated: false };
  }

  public isInFlight(key: string): boolean {
    return this.inFlightRequests.has(key);
  }

  public inFlightCount(): number {
    return this.inFlightRequests.size;
  }

  public clear(): void {
    this.inFlightRequests.clear();
  }
}

export const globalRequestDeduplicator = new RequestDeduplicator();
