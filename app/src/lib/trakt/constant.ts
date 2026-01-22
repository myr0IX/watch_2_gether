/**
 * Trakt API Constants
 */

export const TRAKT_API_BASE_URL = "https://api.trakt.tv";
export const TRAKT_SEARCH_ENDPOINT = "/search";

export const TRAKT_API_VERSION = "2";
export const TRAKT_CONTENT_TYPE = "application/json";

/**
 * Default pagination
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 5;
export const MAX_LIMIT = 5;

/**
 * Full search endpoint URL
 */
export const TRAKT_SEARCH_URL = `${TRAKT_API_BASE_URL}${TRAKT_SEARCH_ENDPOINT}`;
