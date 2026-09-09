# Supabase Rules

Use Supabase PostgreSQL as the database.

## Client separation

Browser client:
lib/supabase/client.ts

Server client:
lib/supabase/server.ts

Administrative server-only client:
lib/supabase/admin.ts

Never import admin.ts into Client Components.

## Environment variables

Public:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Private:

SUPABASE_SECRET_KEY

Never expose the secret key.

## Database

Current table:

gifts

Fields:

- id
- slug
- sender_name
- receiver_name
- title
- message
- start_date
- theme
- created_at
- updated_at

Do not create additional tables unless requested.

## Data access

Validate all external input.

Handle Supabase errors explicitly.

Do not silently ignore failed queries.

Use server-side database access whenever possible.