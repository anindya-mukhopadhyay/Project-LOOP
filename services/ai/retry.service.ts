import { ServiceError } from "../errors";

export class RetryService {
  /**
   * Wraps an async function with retry logic using exponential backoff.
   *
   * @param operation The async function to execute.
   * @param maxRetries Maximum number of times to retry (default: 3).
   * @param baseDelayMs Base delay for backoff in milliseconds (default: 1000).
   * @returns The result of the operation if successful.
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          throw new ServiceError(
            `Operation failed after ${maxRetries} retries: ${error instanceof Error ? error.message : "Unknown error"}`,
            "INTERNAL_ERROR"
          );
        }

        // Exponential backoff with some jitter
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + (Math.random() * 500);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new ServiceError("Unexpected retry loop exit", "INTERNAL_ERROR");
  }
}
