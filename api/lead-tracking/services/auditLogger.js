const fs = require('fs').promises;
const path = require('path');

class NotificationAuditLogger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.currentLogFile = null;
    this.logBuffer = [];
    this.flushInterval = 5000; // Flush every 5 seconds
    
    // Initialize logger
    this.init();
  }

  async init() {
    try {
      // Create logs directory if it doesn't exist
      await fs.mkdir(this.logDir, { recursive: true });
      
      // Start buffer flush timer
      this.startFlushTimer();
      
      console.log('Notification audit logger initialized');
    } catch (error) {
      console.error('Failed to initialize audit logger:', error);
    }
  }

  async log(data) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      leadId: data.leadId || 'unknown',
      score: data.score || 0,
      alertType: data.alertType || 'unknown',
      channel: data.channel || 'unknown',
      recipient: this.sanitizeRecipient(data.recipient),
      status: data.status || 'unknown',
      error: data.error || null,
      retryCount: data.retryCount || 0,
      messageId: data.messageId || null,
      metadata: {
        userAgent: data.userAgent,
        pageUrl: data.pageUrl,
        sessionDuration: data.sessionDuration
      }
    };

    // Add to buffer
    this.logBuffer.push(auditEntry);

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Audit log:', {
        leadId: auditEntry.leadId,
        channel: auditEntry.channel,
        status: auditEntry.status,
        error: auditEntry.error
      });
    }

    // Flush immediately for errors
    if (data.status === 'failed' || data.error) {
      await this.flush();
    }

    return auditEntry;
  }

  sanitizeRecipient(recipient) {
    if (!recipient) return 'unknown';
    
    // Mask phone numbers and emails for privacy
    if (recipient.includes('@')) {
      // Email: show first 3 chars + domain
      const [username, domain] = recipient.split('@');
      const masked = username.substring(0, 3) + '***';
      return `${masked}@${domain}`;
    } else if (recipient.match(/^\+?\d{10,}$/)) {
      // Phone: show country code and last 4 digits
      const cleaned = recipient.replace(/\D/g, '');
      const lastFour = cleaned.slice(-4);
      const prefix = cleaned.slice(0, -7);
      return `${prefix}***${lastFour}`;
    }
    
    return recipient;
  }

  async flush() {
    if (this.logBuffer.length === 0) return;

    try {
      // Get current log file name (rotate daily)
      const date = new Date();
      const logFileName = `notifications-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
      const logFilePath = path.join(this.logDir, logFileName);

      // Convert buffer to JSONL format (one JSON object per line)
      const logLines = this.logBuffer.map(entry => JSON.stringify(entry)).join('\n') + '\n';

      // Append to log file
      await fs.appendFile(logFilePath, logLines);

      // Clear buffer
      const flushedCount = this.logBuffer.length;
      this.logBuffer = [];

      // Update current log file reference
      this.currentLogFile = logFilePath;

      console.log(`Flushed ${flushedCount} audit entries to ${logFileName}`);
    } catch (error) {
      console.error('Failed to flush audit log:', error);
      // Keep entries in buffer to retry later
    }
  }

  startFlushTimer() {
    setInterval(() => {
      this.flush().catch(error => {
        console.error('Audit log flush timer error:', error);
      });
    }, this.flushInterval);
  }

  async getRecentLogs(minutes = 60) {
    try {
      const logs = [];
      const cutoffTime = Date.now() - (minutes * 60 * 1000);

      // Read today's log file
      if (this.currentLogFile) {
        const content = await fs.readFile(this.currentLogFile, 'utf8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          if (line) {
            try {
              const entry = JSON.parse(line);
              const entryTime = new Date(entry.timestamp).getTime();
              
              if (entryTime >= cutoffTime) {
                logs.push(entry);
              }
            } catch (error) {
              // Skip malformed lines
            }
          }
        }
      }

      // Include buffered entries
      for (const entry of this.logBuffer) {
        const entryTime = new Date(entry.timestamp).getTime();
        if (entryTime >= cutoffTime) {
          logs.push(entry);
        }
      }

      return logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get recent logs:', error);
      return [];
    }
  }

  async getStats(hours = 24) {
    const logs = await this.getRecentLogs(hours * 60);
    
    const stats = {
      total: logs.length,
      byStatus: {},
      byChannel: {},
      byAlertType: {},
      failures: [],
      averageScore: 0
    };

    let totalScore = 0;

    for (const log of logs) {
      // By status
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
      
      // By channel
      stats.byChannel[log.channel] = (stats.byChannel[log.channel] || 0) + 1;
      
      // By alert type
      stats.byAlertType[log.alertType] = (stats.byAlertType[log.alertType] || 0) + 1;
      
      // Track failures
      if (log.status === 'failed') {
        stats.failures.push({
          timestamp: log.timestamp,
          leadId: log.leadId,
          error: log.error,
          channel: log.channel
        });
      }
      
      // Calculate average score
      totalScore += log.score || 0;
    }

    stats.averageScore = logs.length > 0 ? Math.round(totalScore / logs.length) : 0;
    stats.successRate = logs.length > 0 
      ? Math.round(((stats.byStatus.sent || 0) / logs.length) * 100) 
      : 0;

    return stats;
  }

  // Clean up old log files
  async cleanup(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.logDir);
      const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        if (file.startsWith('notifications-') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffDate) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old audit log files`);
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return 0;
    }
  }
}

// Export singleton instance
module.exports = new NotificationAuditLogger();