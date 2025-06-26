/**
 * MongoDB Connection Test Script
 * Tests the database schemas and connection
 */

const DataStorage = require('./services/dataStorage');

async function testMongoDB() {
    console.log('=== MongoDB Connection Test ===\n');
    
    const storage = new DataStorage();
    
    try {
        console.log('1. Initializing database connection...');
        await storage.initDatabase();
        
        if (storage.inMemoryMode) {
            console.log('\n❌ MongoDB is not running. The system is using in-memory storage.');
            console.log('\nTo use MongoDB:');
            console.log('1. Install MongoDB: brew install mongodb-community');
            console.log('2. Start MongoDB: brew services start mongodb-community');
            console.log('3. Run this test again\n');
            return;
        }
        
        console.log('✅ Connected to MongoDB successfully!\n');
        
        // Test storing a session
        console.log('2. Testing session storage...');
        const testSession = {
            id: 'test-session-' + Date.now(),
            visitor: {
                userAgent: 'Mozilla/5.0 Test Browser',
                referrer: 'https://google.com',
                device: 'desktop'
            },
            startTime: new Date(),
            lastActivity: new Date(),
            pageViews: [
                { url: '/', title: 'Home', timestamp: Date.now() }
            ],
            events: [
                { type: 'pageView', timestamp: Date.now() }
            ],
            score: 75,
            scoreBreakdown: {
                timeOnSite: 20,
                pageDepth: 15,
                engagement: 25,
                intent: 15
            }
        };
        
        await storage.storeSession(testSession);
        console.log('✅ Session stored successfully\n');
        
        // Test retrieving session
        console.log('3. Testing session retrieval...');
        const retrieved = await storage.getSession(testSession.id);
        console.log('✅ Session retrieved:', retrieved.sessionId, '\n');
        
        // Test storing an alert
        console.log('4. Testing alert storage...');
        await storage.storeAlert({
            level: 'high',
            type: 'highValueLead',
            message: 'Test high-value lead detected',
            sessionId: testSession.id,
            details: { score: 75 }
        });
        console.log('✅ Alert stored successfully\n');
        
        // Test getting dashboard stats
        console.log('5. Testing dashboard statistics...');
        const stats = await storage.getDashboardStats();
        console.log('✅ Dashboard stats retrieved:');
        console.log('   - Active visitors:', stats.current.activeVisitors);
        console.log('   - Daily leads:', stats.current.dailyLeads);
        console.log('   - High-value leads:', stats.current.highValueLeads);
        console.log('   - Average score:', stats.scoring.averageScore);
        console.log('\n');
        
        // Check collections
        console.log('6. Database collections created:');
        const collections = await storage.db.listCollections().toArray();
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        console.log('\n✅ All tests passed! MongoDB integration is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        // Clean up
        if (storage.client) {
            await storage.close();
        }
    }
}

// Run the test
testMongoDB().catch(console.error);