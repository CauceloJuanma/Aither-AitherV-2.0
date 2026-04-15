import Database from 'better-sqlite3';
import { createClient, Client } from '@libsql/client';
import path from 'path';

// Determine which database to use based on environment variable
const USE_TURSO = process.env.USE_TURSO === 'true';

// Singleton instances
let localDb: Database.Database | null = null;
let tursoClient: Client | null = null;

// Types for SQL parameters
type SqlValue = string | number | boolean | null | bigint | Uint8Array;
type SqlParams = SqlValue[];

// Unified database interface type
interface UnifiedStatement {
  all: (params?: SqlParams) => unknown[];
  get: (params?: SqlParams) => unknown;
  run: (params?: SqlParams) => { lastInsertRowid: number | bigint; changes: number };
}

interface UnifiedDatabase {
  prepare: (sql: string) => UnifiedStatement;
  pragma: (pragma: string) => void;
  close: () => void;
}

/**
 * Get local SQLite database connection (better-sqlite3)
 */
function getLocalDatabase(): Database.Database {
  if (!localDb) {
    const dbPath = path.join(process.cwd(), 'app_1mesfinal2.db');

    localDb = new Database(dbPath, {
      readonly: false,
      fileMustExist: true
    });

    // Enable WAL mode for better concurrent access
    localDb.pragma('journal_mode = WAL');

    console.log('✅ Local SQLite database connected');
  }

  return localDb;
}

/**
 * Get Turso database client (libsql)
 */
function getTursoClient(): Client {
  if (!tursoClient) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set when USE_TURSO=true');
    }

    tursoClient = createClient({
      url,
      authToken
    });

    console.log('✅ Turso database connected');
  }

  return tursoClient;
}

/**
 * Wrapper for Turso client to match better-sqlite3 API
 */
function createTursoWrapper(_client: Client): UnifiedDatabase {
  return {
    prepare: (_sql: string) => {
      return {
        all: (_params?: SqlParams) => {
          // Turso is async but we need sync - this won't work directly
          // We need to use a different approach
          throw new Error('Use async methods with Turso. Call getTursoClient() directly for async operations.');
        },
        get: (_params?: SqlParams) => {
          throw new Error('Use async methods with Turso. Call getTursoClient() directly for async operations.');
        },
        run: (_params?: SqlParams) => {
          throw new Error('Use async methods with Turso. Call getTursoClient() directly for async operations.');
        }
      };
    },
    pragma: () => {
      // Turso doesn't support pragmas
      console.warn('⚠️  Pragmas are not supported with Turso');
    },
    close: () => {
      if (tursoClient) {
        tursoClient.close();
        tursoClient = null;
        console.log('❌ Turso database connection closed');
      }
    }
  };
}

/**
 * Get database connection (unified interface)
 * Returns the appropriate database based on USE_TURSO environment variable
 *
 * Note: When using Turso, you should use async/await patterns.
 * For local SQLite, synchronous operations are supported.
 */
export function getDatabase(): Database.Database {
  if (USE_TURSO) {
    console.warn('⚠️  Using Turso mode. For API routes, use getTursoClient() for async operations.');
    // Return wrapper that will throw errors if sync methods are called
    return createTursoWrapper(getTursoClient()) as unknown as Database.Database;
  }

  return getLocalDatabase();
}

/**
 * Get Turso client for async operations
 * Only use this when USE_TURSO=true
 */
export function getTursoClientForAsync(): Client | null {
  if (!USE_TURSO) {
    return null;
  }
  return getTursoClient();
}

/**
 * Execute a query with unified interface (works with both local and Turso)
 * This is the recommended way to query when you want to support both modes
 */
export async function executeQuery<T = unknown>(sql: string, params?: SqlParams): Promise<T[]> {
  if (USE_TURSO) {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: params || []
    });
    return result.rows as T[];
  } else {
    const db = getLocalDatabase();
    const stmt = db.prepare(sql);
    return stmt.all(params || []) as T[];
  }
}

/**
 * Execute a query and get a single row
 */
export async function executeQueryOne<T = unknown>(sql: string, params?: SqlParams): Promise<T | undefined> {
  if (USE_TURSO) {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: params || []
    });
    return result.rows[0] as T | undefined;
  } else {
    const db = getLocalDatabase();
    const stmt = db.prepare(sql);
    return stmt.get(params || []) as T | undefined;
  }
}

/**
 * Execute an insert/update/delete query
 */
export async function executeUpdate(sql: string, params?: SqlParams): Promise<{ lastInsertRowid: number | bigint; changes: number }> {
  if (USE_TURSO) {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: params || []
    });
    return {
      lastInsertRowid: result.lastInsertRowid || 0,
      changes: result.rowsAffected
    };
  } else {
    const db = getLocalDatabase();
    const stmt = db.prepare(sql);
    return stmt.run(params || []);
  }
}

/**
 * Check if using Turso mode
 */
export function isTursoMode(): boolean {
  return USE_TURSO;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (USE_TURSO) {
    if (tursoClient) {
      tursoClient.close();
      tursoClient = null;
      console.log('❌ Turso database connection closed');
    }
  } else {
    if (localDb) {
      localDb.close();
      localDb = null;
      console.log('❌ SQLite database connection closed');
    }
  }
}

// Export the database instance getter as default
export default getDatabase;
