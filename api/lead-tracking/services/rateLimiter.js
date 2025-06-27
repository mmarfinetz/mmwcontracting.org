class RateLimiter {
  constructor() {
    // Rate limit configurations
    this.limits = {
      sms: {
        perHour: parseInt(process.env.SMS_RATE_LIMIT_PER_HOUR) || 20,
        perDay: parseInt(process.env.SMS_RATE_LIMIT_PER_DAY) || 100
      },
      email: {
        perHour: parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR) || 100,
        perDay: parseInt(process.env.EMAIL_RATE_LIMIT_PER_DAY) || 1000
      }
    };

    // In-memory usage tracking (in production, use Redis or similar)
    this.usage = new Map();
    
    // Clean up old entries periodically
    this.startCleanupTimer();
  }

  async canSend(channel, recipient) {
    if (!this.limits[channel]) {
      throw new Error(`Unknown channel: ${channel}`);
    }

    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);

    const key = `${channel}:${recipient}`;
    const usageHistory = this.usage.get(key) || [];

    // Filter to only recent usage
    const recentUsage = usageHistory.filter(timestamp => timestamp > dayAgo);
    
    // Count usage in last hour and day
    const hourlyUsage = recentUsage.filter(timestamp => timestamp > hourAgo).length;
    const dailyUsage = recentUsage.length;

    // Check limits
    if (hourlyUsage >= this.limits[channel].perHour) {
      console.warn(`Rate limit exceeded for ${channel} to ${recipient}: ${hourlyUsage} in last hour`);
      return false;
    }

    if (dailyUsage >= this.limits[channel].perDay) {
      console.warn(`Daily rate limit exceeded for ${channel} to ${recipient}: ${dailyUsage} today`);
      return false;
    }

    return true;
  }

  async recordUsage(channel, recipient) {
    const key = `${channel}:${recipient}`;
    const usageHistory = this.usage.get(key) || [];
    
    // Add current timestamp
    usageHistory.push(Date.now());
    
    // Keep only last 24 hours of data
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentUsage = usageHistory.filter(timestamp => timestamp > dayAgo);
    
    this.usage.set(key, recentUsage);
    
    // Log current usage stats
    const hourAgo = Date.now() - (60 * 60 * 1000);
    const hourlyUsage = recentUsage.filter(timestamp => timestamp > hourAgo).length;
    
    console.log(`Rate limiter: ${channel} to ${recipient} - ${hourlyUsage}/hr, ${recentUsage.length}/day`);
  }

  async getRemainingQuota(channel, recipient) {
    if (!this.limits[channel]) {
      throw new Error(`Unknown channel: ${channel}`);
    }

    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);

    const key = `${channel}:${recipient}`;
    const usageHistory = this.usage.get(key) || [];

    // Filter to only recent usage
    const recentUsage = usageHistory.filter(timestamp => timestamp > dayAgo);
    
    // Count usage in last hour and day
    const hourlyUsage = recentUsage.filter(timestamp => timestamp > hourAgo).length;
    const dailyUsage = recentUsage.length;

    return {
      hourly: {
        used: hourlyUsage,
        limit: this.limits[channel].perHour,
        remaining: Math.max(0, this.limits[channel].perHour - hourlyUsage)
      },
      daily: {
        used: dailyUsage,
        limit: this.limits[channel].perDay,
        remaining: Math.max(0, this.limits[channel].perDay - dailyUsage)
      }
    };
  }

  startCleanupTimer() {
    // Clean up old entries every hour
    setInterval(() => {
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      for (const [key, usageHistory] of this.usage.entries()) {
        const recentUsage = usageHistory.filter(timestamp => timestamp > dayAgo);
        
        if (recentUsage.length === 0) {
          // Remove empty entries
          this.usage.delete(key);
        } else if (recentUsage.length < usageHistory.length) {
          // Update with cleaned data
          this.usage.set(key, recentUsage);
        }
      }
      
      console.log(`Rate limiter cleanup: ${this.usage.size} active entries`);
    }, 60 * 60 * 1000); // Every hour
  }

  // Get current usage statistics
  getStats() {
    const stats = {
      totalEntries: this.usage.size,
      channels: {}
    };

    for (const channel of Object.keys(this.limits)) {
      stats.channels[channel] = {
        recipients: 0,
        totalUsage: 0
      };
    }

    for (const [key, usageHistory] of this.usage.entries()) {
      const [channel] = key.split(':');
      if (stats.channels[channel]) {
        stats.channels[channel].recipients++;
        stats.channels[channel].totalUsage += usageHistory.length;
      }
    }

    return stats;
  }

  // Reset rate limits for testing purposes
  reset() {
    this.usage.clear();
    console.log('Rate limiter reset');
  }
}

// Export singleton instance
module.exports = new RateLimiter();