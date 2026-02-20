# Cultural Events Platform - Dhaka

A comprehensive platform for discovering cultural events in Dhaka, Bangladesh.

## Features

- Event discovery with advanced filtering
- User authentication (Email + Google OAuth)
- Save events and set reminders
- Organizer portal for event submission
- Admin panel for event management
- AI-powered event extraction
- Weekly email digest
- SEO optimized

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend (for reminders and digest)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials and API keys.

4. Run database migrations:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migrations from `supabase/migrations/`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes
│   ├── (auth)/            # Auth routes
│   ├── (user)/            # User dashboard
│   ├── (admin)/           # Admin panel
│   ├── (organizer)/       # Organizer portal
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & helpers
├── specs/                 # Documentation
└── supabase/              # Database migrations
```

## Documentation

See `/specs` folder for:
- PRD.md - Product Requirements Document
- Schema.md - Database schema
- API.md - API documentation
- UI.md - UI/UX design system

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

ISC
