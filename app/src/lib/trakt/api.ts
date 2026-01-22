import { TRAKT_SEARCH_URL, TRAKT_API_VERSION, TRAKT_CONTENT_TYPE } from "./constant";

/**
 * Get Trakt API client ID from environment
 */
function getClientId(): string {
  const clientId = process.env.TRAKT_CLIENT_ID;
  if (!clientId) {
    throw new Error("TRAKT_CLIENT_ID environment variable is not set");
  }
  return clientId;
}

/**
 * Call Trakt Search API
 * GET /search endpoint with filtering and pagination
 */
export async function searchQuery(query: string): Promise<Response> {
  const clientId = getClientId();

  const url = new URL(TRAKT_SEARCH_URL);
  url.search = query;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": TRAKT_CONTENT_TYPE,
      "trakt-api-version": TRAKT_API_VERSION,
      "trakt-api-key": clientId,
      "User-Agent": "Watch2Gether/1.0.0",
    },
  });
}
