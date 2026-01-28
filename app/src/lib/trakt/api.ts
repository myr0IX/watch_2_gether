import {
  TRAKT_API_VERSION,
  TRAKT_CONTENT_TYPE,
  TRAKT_MOVIES_TRENDING_URL,
  TRAKT_SHOWS_TRENDING_URL,
} from "./constant";

function getClientId(): string {
  const clientId = process.env.TRAKT_CLIENT_ID;
  if (!clientId) {
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
  return fetch(url, { method: "GET", headers: buildHeaders() });
}

export async function fetchShowsTrending(queryString: string): Promise<Response> {
  const url = `${TRAKT_SHOWS_TRENDING_URL}?${queryString}`;
  return fetch(url, { method: "GET", headers: buildHeaders() });
}
