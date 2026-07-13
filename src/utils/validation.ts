const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Entity ids are Postgres uuid columns; querying them with a malformed id
 * throws a cast error. Validate before querying so bad ids become 404s.
 */
export const isUuid = (value: string | undefined): boolean =>
  typeof value === 'string' && UUID_REGEX.test(value);
