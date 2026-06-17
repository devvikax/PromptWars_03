# Green Hero: Supabase Backend Database Schema

This directory contains the database migration scripts and functions required to establish the Supabase backend database layer.

## 📂 Contents
* `schema.sql`: Table structure creation schema (`users`, `missions`, `user_missions`, `achievements`, `user_achievements`, `progress_logs`) and Row Level Security (RLS) policies.
* `functions/merge_guest_progress.sql`: Database RPC trigger function used to merge offline guest session completions into authenticated user profiles.

## 🚀 How to Apply

1. Go to your **Supabase Project Dashboard**.
2. Click on the **SQL Editor** in the left sidebar.
3. Click on **New Query**.
4. Copy the contents of `schema.sql` and run the script.
5. Create another query, copy the contents of `functions/merge_guest_progress.sql`, and run the script to register the merge progress RPC function.
