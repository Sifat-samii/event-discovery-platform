# Database Schema Documentation

## Overview

PostgreSQL database via Supabase with the following key tables and relationships.

## Core Tables

### users
User accounts from Supabase Auth (extends auth.users)

```sql
- id (uuid, primary key, references auth.users)
- email (text)
- full_name (text, nullable)
- avatar_url (text, nullable)
- interests (text[], nullable) -- selected during onboarding
- created_at (timestamp)
- updated_at (timestamp)
```

### organizers
Event organizer profiles

```sql
- id (uuid, primary key)
- user_id (uuid, references users.id)
- name (text)
- description (text, nullable)
- website (text, nullable)
- social_links (jsonb, nullable)
- verified (boolean, default false)
- subscription_tier (text, default 'free') -- 'free', 'pro', 'premium'
- created_at (timestamp)
- updated_at (timestamp)
```

### event_categories
Primary event categories (19 categories A-S)

```sql
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique)
- description (text, nullable)
- icon (text, nullable)
- order (integer)
- created_at (timestamp)
```

### event_subcategories
Subcategories under primary categories

```sql
- id (uuid, primary key)
- category_id (uuid, references event_categories.id)
- name (text)
- slug (text)
- description (text, nullable)
- created_at (timestamp)
```

### event_tags
Tags for events (multi-select)

```sql
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique)
- created_at (timestamp)
```

### event_areas
Dhaka area locations

```sql
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique)
- created_at (timestamp)
```

### events
Event listings

```sql
- id (uuid, primary key)
- title (text)
- slug (text, unique)
- description (text)
- poster_url (text, nullable)
- category_id (uuid, references event_categories.id)
- subcategory_id (uuid, references event_subcategories.id, nullable)
- organizer_id (uuid, references organizers.id)
- area_id (uuid, references event_areas.id)
- venue_name (text)
- venue_address (text)
- venue_coordinates (point, nullable) -- for Google Maps
- start_date (timestamp)
- end_date (timestamp)
- start_time (time)
- end_time (time, nullable)
- price_type (text) -- 'free', 'paid'
- price_amount (decimal, nullable)
- ticket_link (text, nullable) -- external URL
- status (text, default 'draft') -- 'draft', 'pending', 'published', 'expired', 'archived'
- verified (boolean, default false)
- featured (boolean, default false)
- source_url (text, nullable) -- for data collection tracking
- last_checked_at (timestamp, nullable)
- data_collection_phase (text, nullable) -- 'phase_a', 'phase_b', 'phase_c'
- created_at (timestamp)
- updated_at (timestamp)
- created_by (uuid, references users.id, nullable)
```

### event_tags_junction
Many-to-many relationship between events and tags

```sql
- event_id (uuid, references events.id)
- tag_id (uuid, references event_tags.id)
- primary key (event_id, tag_id)
```

### saved_events
User saved events

```sql
- id (uuid, primary key)
- user_id (uuid, references users.id)
- event_id (uuid, references events.id)
- created_at (timestamp)
- unique (user_id, event_id)
```

### reminders
Email reminder settings

```sql
- id (uuid, primary key)
- user_id (uuid, references users.id)
- event_id (uuid, references events.id)
- reminder_24h (boolean, default true)
- reminder_3h (boolean, default false)
- sent_24h (boolean, default false)
- sent_3h (boolean, default false)
- created_at (timestamp)
```

### event_reports
User reports for incorrect info

```sql
- id (uuid, primary key)
- event_id (uuid, references events.id)
- user_id (uuid, references users.id, nullable)
- reason (text)
- description (text, nullable)
- status (text, default 'open') -- 'open', 'reviewed', 'resolved'
- reviewed_by (uuid, references users.id, nullable)
- reviewed_at (timestamp, nullable)
- created_at (timestamp)
```

### event_clicks
Analytics tracking for trending algorithm

```sql
- id (uuid, primary key)
- event_id (uuid, references events.id)
- user_id (uuid, references users.id, nullable)
- clicked_at (timestamp)
- source (text, nullable) -- 'home', 'browse', 'search', etc.
```

### featured_listings
Paid featured events

```sql
- id (uuid, primary key)
- event_id (uuid, references events.id)
- placement_type (text) -- 'homepage', 'category_top', 'trending_badge'
- start_date (timestamp)
- end_date (timestamp)
- pricing_weekly (decimal, nullable)
- created_at (timestamp)
```

### organizer_subscriptions
Subscription management

```sql
- id (uuid, primary key)
- organizer_id (uuid, references organizers.id)
- tier (text) -- 'free', 'pro', 'premium'
- start_date (timestamp)
- end_date (timestamp, nullable)
- created_at (timestamp)
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_area ON events(area_id);
CREATE INDEX idx_events_featured ON events(featured) WHERE featured = true;
CREATE INDEX idx_events_verified ON events(verified) WHERE verified = true;
CREATE INDEX idx_saved_events_user ON saved_events(user_id);
CREATE INDEX idx_saved_events_event ON saved_events(event_id);
CREATE INDEX idx_event_clicks_event ON event_clicks(event_id);
CREATE INDEX idx_event_clicks_date ON event_clicks(clicked_at);

-- Full-text search
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('english', title || ' ' || description || ' ' || venue_name));
```

## Seed Data

### Event Categories (19 Primary Categories)
A. Music, B. Theatre & Performing Arts, C. Dance, D. Visual Arts, E. Film & Media, F. Literature, G. Educational / Skill-based, H. Cultural Festivals, I. Hobby & Lifestyle, J. Competitions, K. Campus Events, L. Community & Social Impact, M. Corporate & Professional, N. Religious & Spiritual, O. Family & Kids, P. Food & Culinary, Q. Fashion & Lifestyle, R. Sports & Recreation, S. Hybrid / Experimental

### Event Areas (Dhaka)
Dhanmondi, Gulshan, Uttara, Banani, Wari, Old Dhaka, Motijheel, Mirpur, Baridhara, etc.

### Time Slots
- Morning: 6:00 AM - 12:00 PM
- Afternoon: 12:00 PM - 5:00 PM
- Evening: 5:00 PM - 9:00 PM
- Night: 9:00 PM - 6:00 AM
