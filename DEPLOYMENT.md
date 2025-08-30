# Deployment Guide

## Database Setup

### 1. Run the Updated Schema

Copy and paste the entire contents of `supabase-schema.sql` into your Supabase SQL Editor and execute it. This will:

- Create the `quickadds` table for user-configurable quick add buttons
- Set up Row Level Security (RLS) policies for the new table
- Create necessary indexes for performance

### 2. Verify the Setup

After running the schema, you should see:

- A new `quickadds` table in your Supabase dashboard
- RLS policies for the `quickadds` table
- Indexes for `quickadds` table

### 3. Test the Feature

1. Deploy your updated application
2. Log in to your app
3. Navigate to the "Settings" tab
4. Add some quick add buttons for different entry types
5. Go back to the "Entries" tab and test the quick add functionality

## Features Added

### Configurable Quick Adds
- Users can now create custom quick add buttons for any entry type
- Each quick add has a label, amount, and automatically uses the correct unit
- Quick adds are filtered by entry type and displayed when that type is selected
- Users can edit and delete their quick adds

### Settings Page
- New Settings tab in the main navigation
- Interface for managing quick add buttons
- Add, edit, and delete functionality
- Visual indicators showing the entry type for each quick add

## Database Schema Changes

### New Table: `quickadds`
```sql
create table quickadds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  type text not null,
  label text not null,
  amount numeric not null,
  unit text not null,
  sort_order integer default 0
);
```

### RLS Policies
- Users can only view, insert, update, and delete their own quick adds
- All operations are protected by Row Level Security

### Indexes
- `idx_quickadds_user_id` - for efficient user-based queries
- `idx_quickadds_type` - for filtering by entry type
- `idx_quickadds_sort_order` - for maintaining order
