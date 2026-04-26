import sqlite3 from 'sqlite3';
import path from 'path';

/**
 * Singleton class to manage SQLite database connection and initialization.
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private db: sqlite3.Database;

  private constructor() {
    // Database file will be created in the root of the project
    const dbPath = path.resolve(__dirname, '../../database.db');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to the SQLite database.');
      }
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initializes the database schema.
   */
  public initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Using a composite Primary Key (key, window_start) for optimized lookups
      // and to support atomic UPSERT operations.
      const sql = `
        CREATE TABLE IF NOT EXISTS request_counters (
          key TEXT NOT NULL,
          window_start INTEGER NOT NULL,
          count INTEGER DEFAULT 0,
          last_updated INTEGER NOT NULL,
          PRIMARY KEY (key, window_start)
        )
      `;
      
      this.db.run(sql, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
          reject(err);
        } else {
          console.log('Table "request_counters" initialized with composite PK (key, window_start).');
          resolve();
        }
      });
    });
  }

  /**
   * Returns the database connection instance.
   */
  public getDb(): sqlite3.Database {
    return this.db;
  }
}

// Export a singleton instance
export const dbManager = DatabaseManager.getInstance();
