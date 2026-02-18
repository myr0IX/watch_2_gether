/**
 * Gestion des erreurs et logique de retry pour le système de chat
 */

import { logger } from "@/lib/logger";

/**
 * Vérifie si une erreur est une erreur de rate limit (code 429)
 */
export function isRateLimitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    (error as Record<string, unknown>).statusCode === 429
  );
}

/**
 * Pause l'exécution pendant un nombre de millisecondes spécifié
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gère une erreur de rate limit avec retry
 * Effectue un délai de 60 secondes et retourne true si on doit continuer la boucle
 * Retourne false sinon (l'erreur doit être levée)
 */
export async function handleRateLimitError(error: unknown): Promise<boolean> {
  if (isRateLimitError(error)) {
    logger.debug("Rate limit reached, retrying in 60 seconds", {
      error: error instanceof Error ? error.message : String(error)
    });
    await delay(60000);
    return true; // Continue la boucle
  }
  return false; // L'erreur ne doit pas être retryée
}

/**
 * Wrapper pour exécuter une fonction avec retry automatique sur rate limit
 * Retry indéfiniment jusqu'à ce que l'appel réussisse ou qu'une autre erreur survienne
 */
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
