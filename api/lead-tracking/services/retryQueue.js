class RetryQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS) || 3;
    this.baseDelay = parseInt(process.env.NOTIFICATION_RETRY_DELAY_MS) || 5000;
    this.maxDelay = 60000; // Max 1 minute between retries
    
    // Start processing queue
    this.startProcessor();
  }

  add(notification) {
    // Check if we should retry
    if (notification.attempt >= this.maxRetries) {
      console.error(`Max retries (${this.maxRetries}) reached for notification:`, {
        leadId: notification.leadId,
        alertType: notification.alertType,
        attempt: notification.attempt
      });
      return false;
    }

    // Add to queue with retry metadata
    this.queue.push({
      ...notification,
      addedAt: Date.now(),
      scheduledFor: Date.now() + this.calculateDelay(notification.attempt),
      attempt: notification.attempt || 1
    });

    console.log(`Added notification to retry queue. Attempt ${notification.attempt}/${this.maxRetries}`);
    return true;
  }

  calculateDelay(attempt) {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // Random 0-1 second jitter
    const delay = Math.min(exponentialDelay + jitter, this.maxDelay);
    
    return Math.floor(delay);
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const now = Date.now();
    
    // Find notifications ready to retry
    const readyNotifications = this.queue.filter(n => n.scheduledFor <= now);
    
    for (const notification of readyNotifications) {
      try {
        // Remove from queue before processing
        this.queue = this.queue.filter(n => n !== notification);
        
        console.log(`Retrying notification (attempt ${notification.attempt}/${this.maxRetries}):`, {
          leadId: notification.leadId,
          alertType: notification.alertType,
          channel: notification.channel
        });
        
        // Get notification service instance
        const notificationService = require('./notificationService');
        
        // Retry the notification
        await notificationService.sendNotification({
          leadId: notification.leadId,
          score: notification.score,
          sessionData: notification.sessionData,
          pageUrl: notification.pageUrl,
          alertType: notification.alertType
        });
        
        console.log('Retry successful for notification:', notification.leadId);
      } catch (error) {
        console.error('Retry failed:', error.message);
        
        // Re-add to queue with incremented attempt count
        this.add({
          ...notification,
          attempt: notification.attempt + 1,
          lastError: error.message
        });
      }
    }
    
    this.processing = false;
  }

  startProcessor() {
    // Process queue every 5 seconds
    setInterval(() => {
      this.processQueue().catch(error => {
        console.error('Retry queue processor error:', error);
        this.processing = false;
      });
    }, 5000);
    
    console.log('Retry queue processor started');
  }

  getQueueStatus() {
    const now = Date.now();
    const pending = this.queue.filter(n => n.scheduledFor > now);
    const ready = this.queue.filter(n => n.scheduledFor <= now);
    
    return {
      total: this.queue.length,
      pending: pending.length,
      ready: ready.length,
      processing: this.processing,
      items: this.queue.map(n => ({
        leadId: n.leadId,
        attempt: n.attempt,
        scheduledIn: Math.max(0, n.scheduledFor - now),
        alertType: n.alertType,
        lastError: n.lastError
      }))
    };
  }

  clear() {
    const count = this.queue.length;
    this.queue = [];
    console.log(`Cleared ${count} items from retry queue`);
    return count;
  }

  // Remove specific notification from queue
  remove(leadId) {
    const before = this.queue.length;
    this.queue = this.queue.filter(n => n.leadId !== leadId);
    const removed = before - this.queue.length;
    
    if (removed > 0) {
      console.log(`Removed ${removed} notifications for lead ${leadId} from retry queue`);
    }
    
    return removed;
  }
}

// Export singleton instance
module.exports = new RetryQueue();