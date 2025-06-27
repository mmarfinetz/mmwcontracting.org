class LeadScoringService {
  constructor() {
    // Scoring weights configuration
    this.scoring = {
      behavior: {
        emergencyClick: 30,      // Clicked emergency service button/link
        phoneClick: 25,          // Clicked phone number to call
        contactFormStart: 20,    // Started filling contact form
        multipleServiceViews: 15, // Viewed multiple service pages
        testimonialRead: 10,     // Read testimonials/reviews
        timeOnSite2Min: 15,      // Spent more than 2 minutes on site
        pagesViewed3Plus: 10,    // Viewed 3 or more pages
        downloadedInfo: 15,      // Downloaded service info/brochure
        pricePageView: 20,       // Viewed pricing information
        aboutUsView: 5          // Viewed about us page
      },
      time: {
        afterHours: 20,          // Visiting after business hours (6PM-8AM)
        weekend: 10,             // Visiting on weekend
        businessHours: 5,        // Visiting during business hours
        lateNight: 25           // Visiting late night (10PM-5AM)
      },
      intent: {
        returnVisitor: 15,       // Returning visitor (based on session data)
        directEmergencyNav: 25,  // Navigated directly to emergency page
        emergencySearchKeywords: 20, // Came from search with emergency keywords
        localSearch: 15,         // Came from local search
        mobileDevice: 10,        // Using mobile device (higher urgency)
        nearbyLocation: 20       // Located near service area
      }
    };
  }

  calculateScore(sessionData) {
    let score = 0;
    const scoreBreakdown = {
      behavior: 0,
      time: 0,
      intent: 0,
      bonuses: 0
    };

    // Behavior scoring
    if (sessionData.events) {
      sessionData.events.forEach(event => {
        switch (event.type) {
          case 'click':
            if (this.isEmergencyClick(event)) {
              score += this.scoring.behavior.emergencyClick;
              scoreBreakdown.behavior += this.scoring.behavior.emergencyClick;
            }
            if (this.isPhoneClick(event)) {
              score += this.scoring.behavior.phoneClick;
              scoreBreakdown.behavior += this.scoring.behavior.phoneClick;
            }
            break;
          
          case 'form_start':
            score += this.scoring.behavior.contactFormStart;
            scoreBreakdown.behavior += this.scoring.behavior.contactFormStart;
            break;
          
          case 'page_view':
            if (event.page && event.page.includes('price')) {
              score += this.scoring.behavior.pricePageView;
              scoreBreakdown.behavior += this.scoring.behavior.pricePageView;
            }
            if (event.page && event.page.includes('about')) {
              score += this.scoring.behavior.aboutUsView;
              scoreBreakdown.behavior += this.scoring.behavior.aboutUsView;
            }
            break;
          
          case 'download':
            score += this.scoring.behavior.downloadedInfo;
            scoreBreakdown.behavior += this.scoring.behavior.downloadedInfo;
            break;
        }
      });
    }

    // Time on site scoring
    if (sessionData.duration) {
      const minutes = sessionData.duration / 60000; // Convert ms to minutes
      if (minutes >= 2) {
        score += this.scoring.behavior.timeOnSite2Min;
        scoreBreakdown.behavior += this.scoring.behavior.timeOnSite2Min;
      }
    }

    // Pages viewed scoring
    if (sessionData.pageViews && sessionData.pageViews >= 3) {
      score += this.scoring.behavior.pagesViewed3Plus;
      scoreBreakdown.behavior += this.scoring.behavior.pagesViewed3Plus;
    }

    // Multiple service views
    if (this.hasMultipleServiceViews(sessionData)) {
      score += this.scoring.behavior.multipleServiceViews;
      scoreBreakdown.behavior += this.scoring.behavior.multipleServiceViews;
    }

    // Time-based scoring
    const visitTime = new Date(sessionData.timestamp || Date.now());
    const hour = visitTime.getHours();
    const dayOfWeek = visitTime.getDay();

    if (hour >= 22 || hour < 5) {
      // Late night visit (10 PM - 5 AM)
      score += this.scoring.time.lateNight;
      scoreBreakdown.time += this.scoring.time.lateNight;
    } else if (hour >= 18 || hour < 8) {
      // After hours (6 PM - 8 AM)
      score += this.scoring.time.afterHours;
      scoreBreakdown.time += this.scoring.time.afterHours;
    } else {
      // Business hours
      score += this.scoring.time.businessHours;
      scoreBreakdown.time += this.scoring.time.businessHours;
    }

    // Weekend bonus
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      score += this.scoring.time.weekend;
      scoreBreakdown.time += this.scoring.time.weekend;
    }

    // Intent scoring
    if (sessionData.isReturning) {
      score += this.scoring.intent.returnVisitor;
      scoreBreakdown.intent += this.scoring.intent.returnVisitor;
    }

    // Emergency navigation pattern
    if (this.hasEmergencyNavigationPattern(sessionData)) {
      score += this.scoring.intent.directEmergencyNav;
      scoreBreakdown.intent += this.scoring.intent.directEmergencyNav;
    }

    // Search keywords
    if (this.hasEmergencySearchKeywords(sessionData.referrer)) {
      score += this.scoring.intent.emergencySearchKeywords;
      scoreBreakdown.intent += this.scoring.intent.emergencySearchKeywords;
    }

    // Mobile device bonus
    if (this.isMobileDevice(sessionData.userAgent)) {
      score += this.scoring.intent.mobileDevice;
      scoreBreakdown.intent += this.scoring.intent.mobileDevice;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    return {
      score,
      breakdown: scoreBreakdown,
      factors: this.getScoreFactors(sessionData, scoreBreakdown)
    };
  }

  isEmergencyClick(event) {
    if (!event.target) return false;
    const emergencyKeywords = ['emergency', '24/7', 'urgent', 'immediate', 'now'];
    return emergencyKeywords.some(keyword => 
      event.target.toLowerCase().includes(keyword)
    );
  }

  isPhoneClick(event) {
    if (!event.target) return false;
    return event.target.includes('tel:') || 
           event.target.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
  }

  hasMultipleServiceViews(sessionData) {
    if (!sessionData.pages) return false;
    const servicePages = sessionData.pages.filter(page => 
      page.includes('service') || 
      page.includes('plumbing') || 
      page.includes('repair')
    );
    return servicePages.length >= 2;
  }

  hasEmergencyNavigationPattern(sessionData) {
    if (!sessionData.pages || sessionData.pages.length === 0) return false;
    const firstPage = sessionData.pages[0];
    return firstPage && (
      firstPage.includes('emergency') || 
      firstPage.includes('urgent') ||
      firstPage.includes('24-7')
    );
  }

  hasEmergencySearchKeywords(referrer) {
    if (!referrer) return false;
    const emergencyKeywords = [
      'emergency plumber',
      'plumber near me now',
      'urgent plumbing',
      '24 hour plumber',
      'burst pipe',
      'flooding',
      'water leak emergency'
    ];
    return emergencyKeywords.some(keyword => 
      referrer.toLowerCase().includes(keyword)
    );
  }

  isMobileDevice(userAgent) {
    if (!userAgent) return false;
    const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent);
  }

  getScoreFactors(sessionData, breakdown) {
    const factors = [];
    
    if (breakdown.behavior > 30) {
      factors.push('High engagement behavior');
    }
    if (breakdown.time > 15) {
      factors.push('Urgent timing (after hours/weekend)');
    }
    if (breakdown.intent > 20) {
      factors.push('Strong purchase intent signals');
    }
    if (sessionData.duration && sessionData.duration > 120000) {
      factors.push('Extended site engagement');
    }
    if (this.hasEmergencyNavigationPattern(sessionData)) {
      factors.push('Emergency service interest');
    }
    
    return factors;
  }
}

// Export singleton instance
module.exports = new LeadScoringService();