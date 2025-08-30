# Personal Fitness & Intake Tracker

A modern PWA (Progressive Web App) for tracking daily nutrition and fitness goals. Built with Astro, React, TailwindCSS, and Supabase.

## Features

- 🔐 **Authentication**: Email/password sign up and login
- 📊 **Dashboard**: Real-time tracking of daily totals
- ➕ **Entry Management**: Add, view, and delete entries
- 📱 **PWA**: Installable on iPhone and PC
- 🎨 **Modern UI**: Responsive design with TailwindCSS
- 🔒 **Security**: Row Level Security with Supabase

## Tech Stack

- **Frontend**: Astro + React + TailwindCSS
- **Backend**: Supabase (Postgres, Auth, RLS)
- **Hosting**: Vercel (Frontend) + Supabase (Backend)
- **PWA**: Service Worker + Manifest

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rugged-app
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the following SQL in your Supabase SQL editor:

```sql
-- Create entries table
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  type text not null,
  value numeric not null,
  unit text,
  notes text
);

-- Enable Row Level Security
alter table entries enable row level security;

-- Create RLS policies
create policy "Users can view their own entries" 
  on entries for select using (auth.uid() = user_id);
create policy "Users can insert their own entries" 
  on entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own entries" 
  on entries for update using (auth.uid() = user_id);
create policy "Users can delete their own entries" 
  on entries for delete using (auth.uid() = user_id);
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:4321` to see your app.

### 5. Build and Deploy

```bash
npm run build
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Backend (Supabase)

Your Supabase project is already deployed and ready to use.

## Usage

1. **Sign Up/Login**: Create an account or sign in with email
2. **Add Entries**: Use the form to add water, protein, carbs, caffeine, or exercise
3. **View Dashboard**: See today's totals and all entries
4. **Install PWA**: Click "Install" in your browser to add to home screen

## Entry Types

- **Water**: Track daily water intake (ml)
- **Protein**: Track protein consumption (g)
- **Carbs**: Track carbohydrate intake (g)
- **Caffeine**: Track caffeine consumption (mg)
- **Exercise**: Track workout duration (min)

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthProvider.tsx # Authentication context
│   ├── LoginForm.tsx    # Login/signup form
│   ├── Dashboard.tsx    # Main dashboard
│   ├── EntryForm.tsx    # Add entry form
│   └── EntriesList.tsx  # Display entries
├── lib/
│   └── supabase.ts      # Supabase client & types
├── layouts/
│   └── Layout.astro     # Main layout
└── pages/
    └── index.astro      # Home page
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
