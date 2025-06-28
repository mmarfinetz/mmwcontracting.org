/**
 * Marfinetz Plumbing Lead Tracking System
 * Invisible tracking layer for visitor behavior analysis
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        // Railway backend URL
        apiEndpoint: window.LEAD_TRACKING_API_URL || 'https://mmwcontractingorg-production.up.railway.app',
        sessionKey: 'mp_session_' + Date.now(),
        trackingInterval: 30000, // 30 seconds
        debugMode: false
    };

    // Lead Tracker Class
    class LeadTracker {
        constructor() {
            this.session = {
                id: this.generateSessionId(),
                startTime: Date.now(),
                pageViews: [],
                events: [],
                score: 0,
                lastActivity: Date.now()
            };
            
            this.scoreModifiers = {
                time: {
                    afterHours: 20,
                    weekend: 10,
                    businessHours: 5
                },
                behavior: {
                    emergencyClick: 30,
                    phoneClick: 25,
                    contactFormStart: 20,
                    multipleServiceViews: 15,
                    testimonialRead: 10,
                    timeOnSite2Min: 15,
                    pagesViewed3Plus: 10
                },
                intent: {
                    returnVisitor: 15,
                    directEmergencyNav: 25,
                    emergencySearchKeywords: 20
                }
            };

            this.init();
        }

        init() {
            // Initialize tracking
            this.trackPageView();
            this.setupEventListeners();
            this.startTimeTracking();
            this.detectVisitorInfo();
            
            // Check for return visitor
            if (this.isReturnVisitor()) {
                this.updateScore('intent', 'returnVisitor');
            }
        }

        generateSessionId() {
            return 'xxxx-xxxx-xxxx'.replace(/[x]/g, () => 
                (Math.random() * 16 | 0).toString(16)
            );
        }

        setupEventListeners() {
            // Emergency window tracking
            this.trackElementClicks(['#emergency', '.emergency-window', '.emergency-call-button'], 'emergencyClick');
            
            // Phone number clicks
            this.trackElementClicks(['[href^="tel:"]', '.phone-number'], 'phoneClick');
            
            // Service browsing
            this.trackWindowOpen(['#services-window', '.service-item'], 'serviceBrowse');
            
            // Form engagement
            this.trackFormEngagement();
            
            // Scroll depth tracking
            this.trackScrollDepth();
            
            // Mouse movement for engagement
            this.trackMouseMovement();
            
            // Page unload
            window.addEventListener('beforeunload', () => this.sendData(true));
        }

        trackElementClicks(selectors, eventType) {
            selectors.forEach(selector => {
                document.addEventListener('click', (e) => {
                    if (e.target.matches(selector) || e.target.closest(selector)) {
                        this.recordEvent(eventType, {
                            element: selector,
                            text: e.target.textContent.substring(0, 50)
                        });
                        
                        // Update score based on event type
                        if (this.scoreModifiers.behavior[eventType]) {
                            this.updateScore('behavior', eventType);
                        }
                    }
                });
            });
        }

        trackWindowOpen(selectors, eventType) {
            // Monitor for window visibility changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        selectors.forEach(selector => {
                            const elem = document.querySelector(selector);
                            if (elem && this.isElementVisible(elem)) {
                                this.recordEvent(eventType, {
                                    window: selector,
                                    action: 'opened'
                                });
                            }
                        });
                    }
                });
            });

            // Observe body for style changes
            observer.observe(document.body, {
                attributes: true,
                subtree: true,
                attributeFilter: ['style']
            });
        }

        trackFormEngagement() {
            const formElements = ['input', 'textarea', 'select'];
            let formStarted = false;

            formElements.forEach(tag => {
                document.addEventListener('focus', (e) => {
                    if (e.target.matches(tag) && !formStarted) {
                        formStarted = true;
                        this.recordEvent('contactFormStart', {
                            field: e.target.name || e.target.id
                        });
                        this.updateScore('behavior', 'contactFormStart');
                    }
                }, true);
            });
        }

        trackScrollDepth() {
            let maxScroll = 0;
            
            window.addEventListener('scroll', () => {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    
                    if (scrollPercent > 75 && !this.session.events.find(e => e.type === 'deepScroll')) {
                        this.recordEvent('deepScroll', { depth: Math.round(scrollPercent) });
                    }
                }
            });
        }

        trackMouseMovement() {
            let lastMove = Date.now();
            let moveCount = 0;
            
            document.addEventListener('mousemove', () => {
                const now = Date.now();
                if (now - lastMove > 1000) { // Throttle to once per second
                    moveCount++;
                    lastMove = now;
                    this.session.lastActivity = now;
                }
            });
        }

        trackPageView() {
            const pageData = {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
                timestamp: Date.now()
            };

            this.session.pageViews.push(pageData);
            this.recordEvent('pageView', pageData);

            // Check for emergency intent
            if (window.location.hash === '#emergency' || window.location.pathname.includes('emergency')) {
                this.updateScore('intent', 'directEmergencyNav');
            }

            // Update score for multiple page views
            if (this.session.pageViews.length >= 3) {
                this.updateScore('behavior', 'pagesViewed3Plus');
            }
        }

        startTimeTracking() {
            // Check time-based scoring
            this.checkTimeBasedScoring();
            
            // Track time on site
            setInterval(() => {
                const timeOnSite = (Date.now() - this.session.startTime) / 1000;
                
                if (timeOnSite > 120 && !this.session.events.find(e => e.type === 'timeOnSite2Min')) {
                    this.recordEvent('timeOnSite2Min', { seconds: Math.round(timeOnSite) });
                    this.updateScore('behavior', 'timeOnSite2Min');
                }

                // Send data periodically
                this.sendData();
            }, config.trackingInterval);
        }

        checkTimeBasedScoring() {
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay();

            // After hours (before 8am or after 6pm)
            if (hour < 8 || hour >= 18) {
                this.updateScore('time', 'afterHours');
            } else {
                this.updateScore('time', 'businessHours');
            }

            // Weekend
            if (day === 0 || day === 6) {
                this.updateScore('time', 'weekend');
            }
        }

        detectVisitorInfo() {
            // Get visitor information
            this.session.visitor = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                referrer: document.referrer,
                device: this.getDeviceType()
            };

            // Check for emergency search keywords in referrer
            if (document.referrer.includes('google') || document.referrer.includes('bing')) {
                const emergencyKeywords = ['emergency', 'urgent', 'leak', 'burst', 'flood', 'broken'];
                if (emergencyKeywords.some(keyword => document.referrer.toLowerCase().includes(keyword))) {
                    this.updateScore('intent', 'emergencySearchKeywords');
                }
            }
        }

        getDeviceType() {
            const ua = navigator.userAgent;
            if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
            if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
            return 'desktop';
        }

        isReturnVisitor() {
            try {
                const stored = sessionStorage.getItem('mp_return');
                if (stored) return true;
                sessionStorage.setItem('mp_return', '1');
                return false;
            } catch (e) {
                return false;
            }
        }

        isElementVisible(elem) {
            const style = window.getComputedStyle(elem);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }

        updateScore(category, modifier) {
            const points = this.scoreModifiers[category][modifier] || 0;
            this.session.score = Math.min(100, this.session.score + points);
            
            this.recordEvent('scoreUpdate', {
                category,
                modifier,
                points,
                newScore: this.session.score
            });

            // Check for alert triggers
            this.checkAlertTriggers();
        }

        checkAlertTriggers() {
            const score = this.session.score;
            let alertLevel = null;

            if (score >= 80) {
                alertLevel = 'immediate';
            } else if (score >= 60) {
                alertLevel = 'high_priority';
            } else if (score >= 40) {
                alertLevel = 'standard';
            }

            if (alertLevel && !this.session.alertSent) {
                this.session.alertLevel = alertLevel;
                this.sendData(true); // Force immediate send
                this.session.alertSent = true;
            }
        }

        recordEvent(type, data = {}) {
            const event = {
                type,
                timestamp: Date.now(),
                data,
                url: window.location.href
            };

            this.session.events.push(event);
            
            if (config.debugMode) {
                console.log('Lead Tracker Event:', event);
            }
        }

        async sendData(immediate = false) {
            // Don't send if no significant activity
            if (!immediate && this.session.events.length < 2) return;

            const payload = {
                session: this.session,
                timestamp: Date.now()
            };

            try {
                const response = await fetch(`${config.apiEndpoint}/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-ID': this.session.id
                    },
                    body: JSON.stringify(payload)
                });

                if (config.debugMode) {
                    console.log('Lead data sent:', response.status);
                }
            } catch (error) {
                if (config.debugMode) {
                    console.error('Failed to send lead data:', error);
                }
            }
        }
    }

    // Initialize tracker when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new LeadTracker());
    } else {
        new LeadTracker();
    }
})();