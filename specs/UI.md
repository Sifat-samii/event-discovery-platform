# UI/UX Design System

## Design Principles

1. **Trust-Centered**: Verified badges, last updated timestamps, clear information
2. **Fast Discovery**: User should find relevant event in under 30 seconds
3. **Mobile-First**: Responsive design for all screen sizes
4. **Accessibility**: WCAG basic compliance

## Component Library

### Base Components (shadcn/ui)

- Button
- Card
- Input
- Select
- Checkbox
- Radio Group
- Dialog
- Dropdown Menu
- Tabs
- Badge
- Avatar
- Skeleton (loading states)

### Custom Components

#### EventCard
Displays event preview with:
- Poster image (with fallback)
- Title
- Category badge
- Date & time
- Venue & area
- Price indicator
- Save button (if authenticated)
- Verified badge (if applicable)

#### EventFilters
Filter sidebar/panel with:
- Category multi-select
- Subcategory select
- Date range picker
- Area select
- Price type toggle
- Time slot select
- This Weekend toggle
- Clear filters button

#### EventDetail
Full event detail view with:
- Hero section (poster, title, category)
- Event information grid
- Google Maps embed
- Action buttons (Save, Share, Add to Calendar)
- Organizer profile link
- Report button
- Last updated timestamp

#### SearchBar
Search input with:
- Placeholder text
- Search icon
- Clear button
- Auto-suggestions (future)

## Page Layouts

### Home Page
- Header with navigation
- Hero section
- Trending This Week (horizontal scroll)
- This Weekend (grid)
- Free Events (grid)
- Category sections (collapsible)
- Newly Added (grid)
- Footer

### Browse Page
- Header with search bar
- Sidebar filters (sticky on desktop, drawer on mobile)
- Event grid/list view toggle
- Sort dropdown
- Results count
- Pagination

### Event Detail Page
- Breadcrumb navigation
- Event detail component
- Related events section
- Footer

### User Dashboard
- Tab navigation (Saved, Upcoming, Past)
- Event list/cards
- Reminder settings panel
- Empty states

### Admin Panel
- Sidebar navigation
- Data tables with sorting/filtering
- Status badges
- Action buttons
- Bulk operations
- Analytics dashboard

## Color Scheme

Using shadcn/ui default color system with:
- Primary: Dark blue/navy
- Secondary: Light gray
- Accent: Highlight color
- Destructive: Red for errors

## Typography

- Headings: Inter, bold
- Body: Inter, regular
- Sizes: Responsive scaling

## Spacing

- Consistent 4px base unit
- Section padding: 24px mobile, 48px desktop
- Card padding: 16px

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Loading States

- Skeleton loaders for content
- Spinner for actions
- Progressive image loading

## Error States

- User-friendly error messages
- Retry buttons
- Fallback content

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Alt text for images
- Color contrast compliance
