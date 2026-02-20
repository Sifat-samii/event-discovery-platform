# API Documentation

## Overview

Next.js API routes located in `/app/api/` directory. All routes use TypeScript and Supabase for data access.

## Authentication

Most routes require authentication via Supabase session. Admin routes require admin role.

## Public API Routes

### GET /api/events
Get list of events with filtering and pagination

**Query Parameters:**
- `category` (string, optional) - Category ID or slug
- `subcategory` (string, optional) - Subcategory ID
- `area` (string, optional) - Area ID or slug
- `date_from` (string, optional) - ISO date string
- `date_to` (string, optional) - ISO date string
- `price_type` (string, optional) - 'free' or 'paid'
- `time_slot` (string, optional) - 'morning', 'afternoon', 'evening', 'night'
- `this_weekend` (boolean, optional) - Filter for this weekend
- `search` (string, optional) - Search in title, venue, organizer
- `sort` (string, optional) - 'soonest', 'trending', 'recent'
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response:**
```json
{
  "events": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /api/events/[id]
Get single event by ID or slug

**Response:**
```json
{
  "id": "uuid",
  "title": "Event Title",
  "description": "...",
  "poster_url": "...",
  "category": {...},
  "organizer": {...},
  "venue_name": "...",
  "start_date": "2024-01-01T10:00:00Z",
  "price_type": "free",
  ...
}
```

### GET /api/events/trending
Get trending events

**Query Parameters:**
- `limit` (number, optional) - Default 10

### GET /api/events/this-weekend
Get events for this weekend

### GET /api/events/free
Get free events

### GET /api/categories
Get all event categories with subcategories

### GET /api/areas
Get all event areas

## Authenticated API Routes

### POST /api/events/[id]/save
Save an event (requires auth)

**Response:**
```json
{
  "success": true,
  "saved": true
}
```

### DELETE /api/events/[id]/save
Unsave an event (requires auth)

### GET /api/user/saved-events
Get user's saved events

### POST /api/events/[id]/reminders
Set reminder preferences for an event

**Body:**
```json
{
  "reminder_24h": true,
  "reminder_3h": false
}
```

### POST /api/events/[id]/report
Report incorrect event information

**Body:**
```json
{
  "reason": "incorrect_date",
  "description": "The date shown is wrong"
}
```

### POST /api/events/[id]/click
Track event click (for analytics)

## Organizer API Routes

### POST /api/organizer/events
Create new event (requires organizer role)

**Body:**
```json
{
  "title": "Event Title",
  "description": "...",
  "category_id": "uuid",
  "venue_name": "...",
  "start_date": "2024-01-01T10:00:00Z",
  ...
}
```

### PUT /api/organizer/events/[id]
Update own event

### GET /api/organizer/events
Get own events

## Admin API Routes

### POST /api/admin/events
Create event (admin)

### PUT /api/admin/events/[id]
Update any event (admin)

### DELETE /api/admin/events/[id]
Delete event (admin)

### POST /api/admin/events/[id]/publish
Publish event

### POST /api/admin/events/[id]/verify
Verify event

### POST /api/admin/organizers/[id]/verify
Verify organizer

### GET /api/admin/reports
Get all reports

### PUT /api/admin/reports/[id]
Update report status

### POST /api/admin/ai/extract
AI event extraction

**Body:**
```json
{
  "url": "https://...",
  "text": "..."
}
```

**Response:**
```json
{
  "title": "...",
  "date": "...",
  "venue": "...",
  "category": "...",
  ...
}
```

### GET /api/admin/analytics
Get analytics data

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common status codes:
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error
