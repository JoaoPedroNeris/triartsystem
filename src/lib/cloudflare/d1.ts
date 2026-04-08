/**
 * Cloudflare D1 REST API client.
 * Server-side only — use in Next.js API routes.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface D1Meta {
  served_by: string;
  duration: number;
  changes: number;
  last_row_id: number;
  changed_db: boolean;
  size_after: number;
  rows_read: number;
  rows_written: number;
}

export interface D1ResultSet<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

export interface D1Statement {
  sql: string;
  params?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getD1Url(): string {
  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const databaseId = getEnv("CLOUDFLARE_D1_DATABASE_ID");
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
}

function getHeaders(): HeadersInit {
  const token = getEnv("CLOUDFLARE_API_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a single SQL statement against D1.
 *
 * @param sql    - SQL query string (use `?` for parameter placeholders).
 * @param params - Optional bind parameters.
 * @returns The first result set returned by D1.
 */
export async function queryD1<T = Record<string, unknown>>(
  sql: string,
  params?: string[],
): Promise<T[]> {
  const response = await fetch(getD1Url(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ sql, params: params ?? [] }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `D1 API request failed (${response.status}): ${text}`,
    );
  }

  const json = await response.json();

  if (!json.success) {
    const messages = (json.errors ?? [])
      .map((e: { message?: string }) => e.message)
      .join("; ");
    throw new Error(`D1 query error: ${messages || "unknown error"}`);
  }

  // The API wraps results in an outer array.
  const resultSet = json.result?.[0];
  return (resultSet?.results ?? []) as T[];
}

/**
 * Execute multiple SQL statements in a single request (batch).
 *
 * D1 processes these statements sequentially and returns one result set per
 * statement, in the same order they were submitted.
 *
 * @param statements - Array of `{ sql, params? }` objects.
 * @returns An array of result sets, one per statement.
 */
export async function queryD1Batch<T = Record<string, unknown>>(
  statements: D1Statement[],
): Promise<D1ResultSet<T>[]> {
  if (statements.length === 0) {
    return [];
  }

  const body = statements.map((s) => ({
    sql: s.sql,
    params: s.params ?? [],
  }));

  const response = await fetch(getD1Url(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `D1 batch API request failed (${response.status}): ${text}`,
    );
  }

  const json = await response.json();

  if (!json.success) {
    const messages = (json.errors ?? [])
      .map((e: { message?: string }) => e.message)
      .join("; ");
    throw new Error(`D1 batch query error: ${messages || "unknown error"}`);
  }

  return (json.result ?? []) as D1ResultSet<T>[];
}
