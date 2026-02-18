import {
  TRAKT_API_VERSION,
  TRAKT_CONTENT_TYPE,
  TRAKT_MOVIES_TRENDING_URL,
  TRAKT_SHOWS_TRENDING_URL,
} from "./constant";
import { logger } from "@/lib/logger";

function getClientId(): string {
  const clientId = process.env.TRAKT_CLIENT_ID;
  if (!clientId) {
    logger.error("Trakt API client ID not configured", {
      envVarName: "TRAKT_CLIENT_ID"
    });
    throw new Error("TRAKT_CLIENT_ID environment variable is not set");
  }
  return clientId;
}

function buildHeaders(): HeadersInit {
  return {
    "Content-Type": TRAKT_CONTENT_TYPE,
    "trakt-api-version": TRAKT_API_VERSION,
    "trakt-api-key": getClientId(),
    "User-Agent": "Watch2Gether/1.0.0",
  };
}

export async function fetchMoviesTrending(queryString: string): Promise<Response> {
  const url = `${TRAKT_MOVIES_TRENDING_URL}?${queryString}`;
  logger.debug("Fetching trending movies from Trakt", { url, queryString });

  try {
    const response = await fetch(url, { method: "GET", headers: buildHeaders() });
    logger.debug("Trakt movies response received", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    return response;
  } catch (error) {
    logger.error("Trakt movies API request failed", {
      url,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function fetchShowsTrending(queryString: string): Promise<Response> {
  const url = `${TRAKT_SHOWS_TRENDING_URL}?${queryString}`;
  logger.debug("Fetching trending shows from Trakt", { url, queryString });

  try {
    const response = await fetch(url, { method: "GET", headers: buildHeaders() });
    logger.debug("Trakt shows response received", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    return response;
  } catch (error) {
    logger.error("Trakt shows API request failed", {
      url,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
