import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

// Single cached admin client (service key, bypasses RLS).
// Passes the 'ws' package as the WebSocket transport so Node 20
// doesn't complain about missing native WebSocket support.
let _client: ReturnType<typeof createClient> | null = null

export function adminClient() {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      { realtime: { transport: ws } },
    )
  }
  return _client
}
