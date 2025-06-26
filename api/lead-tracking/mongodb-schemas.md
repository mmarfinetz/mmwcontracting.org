# MongoDB Database Schemas

## Collections

### 1. `sessions` Collection

Stores visitor session data and lead scoring information.

**Schema:**
```javascript
{
  _id: ObjectId,
  sessionId: String,           // Unique session identifier (indexed, unique)
  visitor: {
    userAgent: String,
    referrer: String,
    device: String,
    ip: String                 // Hashed IP address
  },
  startTime: Date,
  lastActivity: Date,          // Indexed for active visitor queries
  pageViews: [{
    url: String,
    title: String,
    timestamp: Number
  }],
  events: [{
    type: String,
    timestamp: Number,
    data: Object
  }],
  score: Number,               // Lead score 0-100 (indexed)
  scoreBreakdown: {
    timeOnSite: Number,
    pageDepth: Number,
    engagement: Number,
    intent: Number
  },
  storedAt: Date,             // When record was stored (indexed)
  expiresAt: Date             // TTL index - auto-deletes after 30 days
}
```

**Indexes:**
- `sessionId`: Unique index for fast lookups
- `lastActivity`: For finding active visitors
- `score`: For high-value lead queries
- `storedAt`: For time-based analytics
- `expiresAt`: TTL index for automatic cleanup

### 2. `alerts` Collection

Stores notification history for high-value leads and important events.

**Schema:**
```javascript
{
  _id: ObjectId,
  timestamp: Date,            // When alert was triggered (indexed)
  level: String,              // 'high', 'medium', 'low' (indexed)
  type: String,               // Alert type (e.g., 'highValueLead')
  message: String,
  sessionId: String,          // Related session (indexed)
  details: Object             // Additional alert data
}
```

**Indexes:**
- `timestamp`: For recent alert queries
- `level`: For filtering by severity
- `sessionId`: For session-related lookups

### 3. `analytics` Collection

Stores aggregated statistics for performance monitoring.

**Schema:**
```javascript
{
  _id: ObjectId,
  date: Date,                 // Timestamp of snapshot
  type: String,               // 'hourly', 'daily', 'weekly'
  metrics: {
    activeVisitors: Number,
    dailyLeads: Number,
    averageScore: Number,
    conversions: {
      emergencyRate: Number,
      contactRate: Number,
      phoneRate: Number
    }
  }
}
```

**Indexes:**
- `date, type`: Compound unique index for time-series data

### 4. `leads` Collection

Stores qualified leads (score >= 60) for follow-up.

**Schema:**
```javascript
{
  _id: ObjectId,
  sessionId: String,          // Indexed
  score: Number,              // Lead score (indexed)
  qualifiedAt: Date,          // When lead qualified (indexed)
  visitor: Object,            // Visitor information
  pageViews: Array,           // Pages visited
  events: Array,              // User actions
  status: String,             // 'new', 'contacted', 'converted' (indexed)
  notes: [{
    text: String,
    timestamp: Date,
    author: String
  }]
}
```

**Indexes:**
- `sessionId`: For session lookups
- `score`: For sorting by lead quality
- `qualifiedAt`: For time-based queries
- `status`: For lead pipeline management

## Features

### Automatic Fallback
- If MongoDB is unavailable, the system automatically falls back to in-memory storage
- No data loss for active sessions
- Seamless transition when MongoDB becomes available

### Data Retention
- Sessions expire after 30 days (TTL index)
- Alerts and analytics are retained indefinitely
- Qualified leads are permanent records

### Performance Optimizations
- Strategic indexes for common queries
- Efficient aggregation for dashboard stats
- Connection pooling and error handling

## Usage

### Installation
```bash
# Install MongoDB on macOS
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongo mongodb://localhost:27017/lead-tracking
```

### Environment Configuration
Set the MongoDB URL in `.env`:
```
DATABASE_URL=mongodb://localhost:27017/lead-tracking
```

For production with authentication:
```
DATABASE_URL=mongodb://username:password@host:port/database
```