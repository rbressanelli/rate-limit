import { dbManager } from '../database/dbManager';

/**
 * Service to manage periodic database maintenance tasks.
 */
export class CleanupService {
  private static CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes
  private static RETENTION_PERIOD_SECONDS = 60 * 60;   // Keep last 60 minutes of data

  /**
   * Starts the background cleanup worker.
   */
  public static startCleanupWorker() {
    console.log('[CleanupWorker] Starting background cleanup service...');
    
    // Run immediately on start
    this.performCleanup();

    // Schedule periodic runs
    setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Executes the deletion of expired records.
   */
  private static performCleanup() {
    const db = dbManager.getDb();
    const currentTime = Math.floor(Date.now() / 1000);
    const threshold = currentTime - this.RETENTION_PERIOD_SECONDS;

    console.log(`[CleanupWorker] Running cleanup... (Threshold: ${threshold})`);

    const sql = 'DELETE FROM request_counters WHERE window_start < ?';

    db.run(sql, [threshold], function(err) {
      if (err) {
        console.error('[CleanupWorker] Error during cleanup:', err.message);
      } else {
        console.log(`[CleanupWorker] Cleanup completed. Removed ${this.changes} expired records.`);
      }
    });
  }
}
