# Setup Instructions

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Create a `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

3. **Run Database Migrations**
   - Go to Supabase Dashboard > SQL Editor
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_seed_data.sql`

4. **Configure Google OAuth (Optional)**
   - In Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Add your OAuth credentials

5. **Set Up Additional Services (Optional)**
   - **Resend**: For email notifications
     - Add `RESEND_API_KEY` to `.env.local`
   - **OpenAI**: For AI event extraction
     - Add `OPENAI_API_KEY` to `.env.local`
   - **Google Maps**: For venue maps
     - Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`

6. **Run Development Server**
   ```bash
   npm run dev
   ```

## Git Setup

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MVP implementation"
   ```

2. **Connect to GitHub**
   ```bash
   git remote add origin your_github_repo_url
   git branch -M main
   git push -u origin main
   ```

## Next Steps

1. Test the application locally
2. Set up production environment variables
3. Deploy to Vercel (recommended for Next.js)
4. Configure custom domain
5. Set up monitoring and analytics

## Important Notes

- The application uses Supabase for authentication and database
- All API routes are in `/app/api/`
- Database migrations are in `/supabase/migrations/`
- Documentation is in `/specs/`
- Components use shadcn/ui and Tailwind CSS

## Troubleshooting

- If you see authentication errors, check your Supabase credentials
- If database queries fail, ensure migrations have been run
- If images don't load, check Supabase Storage configuration
- For production, ensure all environment variables are set
