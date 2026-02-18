import { logger } from "@/lib/logger";

export function isRateLimitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    (error as Record<string, unknown>).statusCode === 429
  );
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handleRateLimitError(error: unknown): Promise<boolean> {
  if (isRateLimitError(error)) {
    logger.debug("Rate limit reached, retrying in 60 seconds", {
      error: error instanceof Error ? error.message : String(error)
    });
    await delay(60000);
    return true;
  }
  return false;
}

export async function withRateLimitRetry<T>(
  fn: () => Promise<T>
): Promise<T> {
  let retryCount = 0;
  while (true) {
    try {
      if (retryCount > 0) {
        logger.debug("Retrying after rate limit", { retryCount });
      }
      return await fn();
    } catch (error) {
      const shouldRetry = await handleRateLimitError(error);
      if (!shouldRetry) {
        logger.error("Non-retriable error occurred", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          retryCount
        });
        throw error;
      }
      retryCount++;
    }
  }
}
